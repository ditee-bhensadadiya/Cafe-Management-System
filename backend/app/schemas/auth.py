"""
Request/response schemas for authentication endpoints.
Validation rules:
- Name: Only alphabets and spaces, minimum 3 characters
- Email: Valid email format and only gmail.com, yahoo.com, outlook.com
- Phone: Exactly 10 digits
- Password:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
"""

import re
import uuid

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.models.user import UserRole


# -----------------------------
# Regular Expressions
# -----------------------------

NAME_REGEX = re.compile(r"^[A-Za-z ]{3,}$")
PHONE_REGEX = re.compile(r"^[0-9]{10}$")

UPPERCASE_REGEX = re.compile(r"[A-Z]")
LOWERCASE_REGEX = re.compile(r"[a-z]")
DIGIT_REGEX = re.compile(r"[0-9]")
SPECIAL_CHAR_REGEX = re.compile(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\];'`~/\\]")

ALLOWED_EMAIL_DOMAINS = {
    "gmail.com",
    "yahoo.com",
    "outlook.com",
}


# -----------------------------
# Password Validation
# -----------------------------

def validate_password_strength(password: str) -> str:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")

    if not UPPERCASE_REGEX.search(password):
        raise ValueError("Password must contain at least one uppercase letter.")

    if not LOWERCASE_REGEX.search(password):
        raise ValueError("Password must contain at least one lowercase letter.")

    if not DIGIT_REGEX.search(password):
        raise ValueError("Password must contain at least one number.")

    if not SPECIAL_CHAR_REGEX.search(password):
        raise ValueError("Password must contain at least one special character.")

    return password


# -----------------------------
# Register
# -----------------------------

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: str
    password: str
    confirm_password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if not NAME_REGEX.fullmatch(value):
            raise ValueError(
                "Name must contain only letters and spaces and be at least 3 characters long."
            )

        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: EmailStr) -> EmailStr:
        domain = str(value).split("@")[1].lower()

        if domain not in ALLOWED_EMAIL_DOMAINS:
            raise ValueError(
                "Only Gmail, Yahoo, and Outlook email addresses are allowed."
            )

        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not PHONE_REGEX.fullmatch(value):
            raise ValueError(
                "Phone number must contain exactly 10 digits."
            )

        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)

    @model_validator(mode="after")
    def validate_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Password and Confirm Password do not match.")

        return self


# -----------------------------
# Admin Register
# -----------------------------

class AdminRegisterRequest(RegisterRequest):
    admin_secret: str


# -----------------------------
# Login
# -----------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: EmailStr) -> EmailStr:
        domain = str(value).split("@")[1].lower()

        if domain not in ALLOWED_EMAIL_DOMAINS:
            raise ValueError(
                "Only Gmail, Yahoo, and Outlook email addresses are allowed."
            )

        return value


# -----------------------------
# Forgot Password
# -----------------------------

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: EmailStr) -> EmailStr:
        domain = str(value).split("@")[1].lower()

        if domain not in ALLOWED_EMAIL_DOMAINS:
            raise ValueError(
                "Only Gmail, Yahoo, and Outlook email addresses are allowed."
            )

        return value


# -----------------------------
# Reset Password
# -----------------------------

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)

    @model_validator(mode="after")
    def validate_passwords_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError("Password and Confirm Password do not match.")

        return self


# -----------------------------
# Profile Update
# -----------------------------

class ProfileUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=3, max_length=100)
    phone: str | None = None
    address: str | None = Field(None, max_length=500)
    profile_photo_url: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None):
        if value is None:
            return value

        value = value.strip()

        if not NAME_REGEX.fullmatch(value):
            raise ValueError(
                "Name must contain only letters and spaces and be at least 3 characters long."
            )

        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None):
        if value is None:
            return value

        if not PHONE_REGEX.fullmatch(value):
            raise ValueError(
                "Phone number must contain exactly 10 digits."
            )

        return value


# -----------------------------
# Responses
# -----------------------------

class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str
    role: UserRole
    address: str | None = None
    profile_photo_url: str | None = None
    is_active: bool

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    message: str