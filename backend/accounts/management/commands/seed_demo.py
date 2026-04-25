"""
Idempotent demo seeder used by e2e/scenarios.md.

Wipes the alice/bob/charlie users (and their skills, via cascade) and
re-creates them with a deterministic dataset. Safe to run repeatedly.

Usage:
    python manage.py seed_demo
"""

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from skills.models import Skill

DEMO_PASSWORD = "SkSwap!2025"

DEMO_USERS = [
    {"username": "alice", "email": "alice@example.com", "first_name": "Alice"},
    {"username": "bob", "email": "bob@example.com", "first_name": "Bob"},
    {"username": "charlie", "email": "charlie@example.com", "first_name": "Charlie"},
]

DEMO_SKILLS = [
    {
        "owner": "alice",
        "title": "Python tutoring",
        "description": (
            "One-on-one Python help: data structures, OOP, web basics, debugging. "
            "Great for first-year CS students."
        ),
        "category": Skill.Category.CODING,
        "pricing_type": Skill.Pricing.PAID,
        "price": "20.00",
        "contact_pref": Skill.Contact.EMAIL,
        "availability": Skill.Availability.AVAILABLE,
    },
    {
        "owner": "alice",
        "title": "Algebra basics",
        "description": (
            "Free study sessions covering linear equations, factoring and graphing. "
            "I teach for review credit, no charge."
        ),
        "category": Skill.Category.TUTORING,
        "pricing_type": Skill.Pricing.FREE,
        "price": None,
        "contact_pref": Skill.Contact.INAPP,
        "availability": Skill.Availability.AVAILABLE,
    },
    {
        "owner": "bob",
        "title": "Spanish conversation",
        "description": (
            "Conversational Spanish practice with a native speaker. We pick a topic "
            "each session and just chat — no worksheets."
        ),
        "category": Skill.Category.OTHER,
        "pricing_type": Skill.Pricing.PAID,
        "price": "15.00",
        "contact_pref": Skill.Contact.EMAIL,
        "availability": Skill.Availability.AVAILABLE,
    },
]


class Command(BaseCommand):
    help = "Reset demo users (alice/bob/charlie) and seeded skills for e2e tests."

    @transaction.atomic
    def handle(self, *args, **options):
        usernames = [u["username"] for u in DEMO_USERS]
        deleted, _ = User.objects.filter(username__in=usernames).delete()
        if deleted:
            self.stdout.write(self.style.WARNING(f"Removed {deleted} existing demo records"))

        users: dict[str, User] = {}
        for spec in DEMO_USERS:
            users[spec["username"]] = User.objects.create_user(
                username=spec["username"],
                email=spec["email"],
                password=DEMO_PASSWORD,
                first_name=spec["first_name"],
            )

        for spec in DEMO_SKILLS:
            owner = users[spec["owner"]]
            Skill.objects.create(
                owner=owner,
                title=spec["title"],
                description=spec["description"],
                category=spec["category"],
                pricing_type=spec["pricing_type"],
                price=spec["price"],
                contact_pref=spec["contact_pref"],
                availability=spec["availability"],
            )

        self.stdout.write(self.style.SUCCESS("Demo data seeded:"))
        for u in users.values():
            count = Skill.objects.filter(owner=u).count()
            self.stdout.write(f"  • @{u.username}  ({count} skill{'s' if count != 1 else ''})")
        self.stdout.write(f"  password for all demo users: {DEMO_PASSWORD}")
