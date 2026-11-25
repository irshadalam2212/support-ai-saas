"""The customers a workspace supports."""

from typing import Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import WorkspaceAccess, require_workspace_scope
from app.db.session import get_db
from app.models.support import Customer, Ticket
from app.schemas.customer import (
    CustomerCreateRequest,
    CustomerListResponse,
    CustomerResponse,
    CustomerUpdateRequest,
)

router = APIRouter(prefix="/workspaces/{workspace_id}/customers", tags=["customers"])

staff_access = require_workspace_scope("OWNER", "ADMIN", "AGENT")
manager_access = require_workspace_scope("OWNER", "ADMIN")

CustomerSort = Literal["name", "-name", "created_at", "-created_at"]
SORT_ORDERS = {
    "name": func.lower(Customer.name).asc(),
    "-name": func.lower(Customer.name).desc(),
    "created_at": Customer.created_at.asc(),
    "-created_at": Customer.created_at.desc(),
}


def _duplicate_email() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="A customer with this email already exists",
    )


def _has_tickets() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="This customer has tickets and cannot be deleted",
    )


def _get_customer(db: Session, workspace_id: UUID, customer_id: UUID) -> Customer:
    customer = db.scalar(
        select(Customer).where(Customer.workspace_id == workspace_id, Customer.id == customer_id)
    )
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


def _commit_unique(db: Session) -> None:
    """Commit, reporting a clash with another customer's email."""
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise _duplicate_email() from error


@router.get("", response_model=CustomerListResponse, summary="Search and list customers")
def list_customers(
    q: str = Query(default="", max_length=120, description="Part of a name, email, or company"),
    sort: CustomerSort = "name",
    page: int = Query(default=1, ge=1, le=100_000),
    page_size: int = Query(default=25, ge=1, le=100),
    access: WorkspaceAccess = Depends(staff_access),
    db: Session = Depends(get_db),
) -> CustomerListResponse:
    conditions = [Customer.workspace_id == access.workspace.id]
    term = q.strip().lower()
    if term:
        # autoescape treats % and _ typed by the user as ordinary characters.
        conditions.append(or_(*(
            func.lower(column).contains(term, autoescape=True)
            for column in (Customer.name, Customer.email, Customer.company)
        )))

    total = db.scalar(select(func.count()).select_from(Customer).where(*conditions))
    items = db.scalars(
        select(Customer)
        .where(*conditions)
        .order_by(SORT_ORDERS[sort], Customer.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return CustomerListResponse(
        items=[CustomerResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a customer",
)
def create_customer(
    payload: CustomerCreateRequest,
    access: WorkspaceAccess = Depends(staff_access),
    db: Session = Depends(get_db),
) -> CustomerResponse:
    customer = Customer(
        id=uuid4(),
        workspace_id=access.workspace.id,
        created_by=access.membership.user_id,
        **payload.model_dump(),
    )
    db.add(customer)
    _commit_unique(db)
    db.refresh(customer)
    return CustomerResponse.model_validate(customer)


@router.get("/{customer_id}", response_model=CustomerResponse, summary="Get a customer")
def get_customer(
    customer_id: UUID,
    access: WorkspaceAccess = Depends(staff_access),
    db: Session = Depends(get_db),
) -> CustomerResponse:
    return CustomerResponse.model_validate(_get_customer(db, access.workspace.id, customer_id))


@router.patch("/{customer_id}", response_model=CustomerResponse, summary="Update a customer")
def update_customer(
    customer_id: UUID,
    payload: CustomerUpdateRequest,
    access: WorkspaceAccess = Depends(staff_access),
    db: Session = Depends(get_db),
) -> CustomerResponse:
    customer = _get_customer(db, access.workspace.id, customer_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    _commit_unique(db)
    db.refresh(customer)
    return CustomerResponse.model_validate(customer)


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a customer who has no tickets (owner or admin)",
)
def delete_customer(
    customer_id: UUID,
    access: WorkspaceAccess = Depends(manager_access),
    db: Session = Depends(get_db),
) -> None:
    customer = _get_customer(db, access.workspace.id, customer_id)
    ticket = db.scalar(
        select(Ticket.id)
        .where(Ticket.workspace_id == access.workspace.id, Ticket.customer_id == customer.id)
        .limit(1)
    )
    if ticket is not None:
        raise _has_tickets()
    db.delete(customer)
    try:
        db.commit()
    except IntegrityError as error:
        # A ticket was created after the check above.
        db.rollback()
        raise _has_tickets() from error
