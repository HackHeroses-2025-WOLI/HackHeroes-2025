"""SQLAlchemy database models."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class User(Base):
    """User model for authentication (deprecated - migrating to Accounts)."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"


class ReportType(Base):
    """Report type."""
    __tablename__ = "typ_zgloszenia"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column("nazwa", String, unique=True, nullable=False)
    description = Column("opis", String)
    
    # Relationships
    reports = relationship("Report", back_populates="report_type_rel")
    
    def __repr__(self):
        return f"<ReportType(id={self.id}, name='{self.name}')>"


class Account(Base):
    """User account."""
    __tablename__ = "konta"
    
    # Primary Key
    email = Column("login_email", String, primary_key=True, index=True)
    
    # User Information
    full_name = Column("imie_nazwisko", String, nullable=False)
    phone = Column("nr_tel", String(9), nullable=True)
    password_hash = Column("hash_hasla", String, nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    
    # Location
    city = Column("miejscowosc", String, nullable=True)
    
    # Statistics
    resolved_cases = Column("rozwiazane_sprawy", Integer, default=0, nullable=False)
    resolved_cases_this_year = Column("rozwiazane_sprawy_ten_rok", Integer, default=0, nullable=False)
    genpoints = Column(Integer, default=0, nullable=False)
    
    # Foreign Keys
    active_report = Column(
        Integer,
        ForeignKey("zgloszenia.id", use_alter=True, name="fk_konta_zgloszenia", ondelete="SET NULL"),
        nullable=True,
    )
    # JSON field for additional accessibility settings
    availability_json = Column(
        "dostepnosc_json",
        Text,
        nullable=False,
        default="[]",
    )  # JSON string stored for volunteers' schedules
    
    # Relationships
    active_report_rel = relationship(
        "Report",
        foreign_keys=[active_report],
        post_update=True,
        passive_deletes=True,
    )
    reports_created = relationship(
        "Report",
        back_populates="reporter",
        foreign_keys="Report.reporter_email",
        passive_deletes=True,
    )
    
    def __repr__(self):
        return f"<Account(email='{self.email}', full_name='{self.full_name}')>"


class Report(Base):
    """Problem report."""
    __tablename__ = "zgloszenia"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Basic Information
    full_name = Column("imie_nazwisko", String, nullable=False)
    phone = Column("nr_tel", String(9), nullable=False)
    age = Column("wiek", Integer, nullable=False)
    address = Column("adres", String, nullable=False)
    city = Column("miejscowosc", String, nullable=False)
    problem = Column(Text, nullable=False)
    
    # Contact & Status
    contact_ok = Column("czy_do_kontaktu", Boolean, default=True, nullable=False)
    is_reviewed = Column(Boolean, default=False, nullable=False)
    
    # Foreign Keys
    report_type_id = Column("typ_zgloszenia_id", Integer, ForeignKey("typ_zgloszenia.id"), nullable=False)
    reporter_email = Column(
        String,
        ForeignKey("konta.login_email", use_alter=True, name="fk_zgloszenia_konta", ondelete="SET NULL"),
        nullable=True,
    )
    
    # Details
    report_details = Column("zgloszenie_szczegoly", Text, nullable=True)  # JSON or detailed text
    reported_at = Column("data_zgloszenia", DateTime(timezone=True), server_default=func.now(), nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    completed_by_email = Column(
        String,
        ForeignKey("konta.login_email", use_alter=True, name="fk_completed_by", ondelete="SET NULL"),
        nullable=True,
    )
    
    # Relationships
    report_type_rel = relationship("ReportType", back_populates="reports")
    reporter = relationship(
        "Account",
        back_populates="reports_created",
        foreign_keys=[reporter_email],
        passive_deletes=True,
    )
    
    def __repr__(self):
        return f"<Report(id={self.id}, problem='{self.problem[:30]}...')>"
