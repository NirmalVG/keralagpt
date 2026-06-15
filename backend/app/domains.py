VALID_DOMAINS = [
    "performing-arts",
    "literature",
    "history",
    "temple-arch",
    "festivals",
    "cuisine",
    "cinema",
    "geography",
]

DOMAIN_ALIASES = {
    "sacred-arts": "performing-arts",
    "architecture": "temple-arch",
}


def normalize_domain(domain: str | None) -> str | None:
    if not domain:
        return None
    return DOMAIN_ALIASES.get(domain, domain)


def is_valid_domain(domain: str | None) -> bool:
    return domain in VALID_DOMAINS
