"""
Domains Router
Serves metadata about KeralaGPT's 8 knowledge domains.
"""
from fastapi import APIRouter, HTTPException
from app.services.db.supabase_client import get_supabase

router = APIRouter(prefix="/domains", tags=["domains"])

# ── Domain metadata (static) ────────────────────────────────────
DOMAIN_METADATA = [
    {
        "id": "performing-arts",
        "label": "Performing Arts",
        "label_ml": "പ്രകടന കലകൾ",
        "icon": "🎭",
        "description": (
            "Kathakali, Theyyam, Mohiniyattam, Koodiyattam, Koothu, "
            "Ottamthullal, and the classical dance-drama traditions "
            "that define Kerala's artistic identity."
        ),
        "suggested_questions": [
            "What is Theyyam and how is it performed?",
            "Explain the nine rasas in Kathakali",
            "When was Koodiyattam recognized by UNESCO?",
        ],
    },
    {
        "id": "literature",
        "label": "Classical Literature",
        "label_ml": "ക്ലാസിക്കൽ സാഹിത്യം",
        "icon": "📚",
        "description": (
            "From Ramacharitam to modern masters — the literary heritage "
            "that shaped Malayalam as a language of profound expression."
        ),
        "suggested_questions": [
            "Who wrote Ramacharitam and in which script?",
            "What is the Manipravalam literary tradition?",
            "What distinguishes O.V. Vijayan from M.T. Vasudevan Nair?",
        ],
    },
    {
        "id": "history",
        "label": "History & Heritage",
        "label_ml": "ചരിത്രം & പൈതൃകം",
        "icon": "🏛️",
        "description": (
            "Ancient kingdoms, spice trade empires, colonial encounters, "
            "and the modern formation of Kerala state."
        ),
        "suggested_questions": [
            "When was the state of Kerala formed?",
            "What was Vasco da Gama's first landing point in Kerala?",
            "Tell me about the Zamorin dynasty",
        ],
    },
    {
        "id": "temple-arch",
        "label": "Temple Architecture",
        "label_ml": "ക്ഷേത്ര വാസ്തുവിദ്യ",
        "icon": "⛩️",
        "description": (
            "The unique wooden and stone temple structures, Tharavadu "
            "mansions, and sacred architectural traditions of Kerala."
        ),
        "suggested_questions": [
            "What defines Kerala temple architecture?",
            "Describe Padmanabhapuram Palace",
            "What is Tharavadu architecture?",
        ],
    },
    {
        "id": "festivals",
        "label": "Festivals & Rituals",
        "label_ml": "ഉത്സവങ്ങൾ & ആചാരങ്ങൾ",
        "icon": "🎪",
        "description": (
            "Onam, Vishu, Thrissur Pooram, and the vibrant festival "
            "traditions that mark Kerala's cultural calendar."
        ),
        "suggested_questions": [
            "What is Thrissur Pooram?",
            "Explain Onam traditions and significance",
            "How is Vishu celebrated in Kerala?",
        ],
    },
    {
        "id": "cuisine",
        "label": "Cuisine",
        "label_ml": "പാചകരീതി",
        "icon": "🍛",
        "description": (
            "Traditional Sadhya feasts, spice-rich curries, regional cooking "
            "variations, and the culinary wisdom of Kerala."
        ),
        "suggested_questions": [
            "What is a Sadhya and what dishes are served?",
            "History of spice trade in Kerala cuisine",
            "What are traditional Kerala cooking methods?",
        ],
    },
    {
        "id": "cinema",
        "label": "Malayalam Cinema",
        "label_ml": "മലയാള സിനിമ",
        "icon": "🎬",
        "description": (
            "From the New Wave movement to contemporary masters — "
            "the golden age and evolution of Mollywood."
        ),
        "suggested_questions": [
            "What is the Malayalam New Wave cinema movement?",
            "Notable films by Adoor Gopalakrishnan",
            "Evolution of Mollywood from 1950s to present",
        ],
    },
    {
        "id": "geography",
        "label": "Geography & Nature",
        "label_ml": "ഭൂമിശാസ്ത്രം & പ്രകൃതി",
        "icon": "🌿",
        "description": (
            "Backwaters, Western Ghats, biodiversity hotspots, and "
            "the natural landscape that shapes Kerala's identity."
        ),
        "suggested_questions": [
            "How were Kerala's backwaters formed?",
            "Western Ghats biodiversity in Kerala",
            "What makes Kerala's geography unique?",
        ],
    },
]


@router.get("/")
async def list_domains():
    """Return all 8 domains with article counts from the database."""
    # Fetch article counts from Supabase
    counts_by_domain: dict[str, int] = {}
    try:
        db = get_supabase()
        docs = db.table("documents").select("domain").execute()
        for doc in docs.data:
            d = doc.get("domain", "")
            counts_by_domain[d] = counts_by_domain.get(d, 0) + 1
    except Exception as e:
        print(f"[domains] Could not fetch article counts: {e}")

    result = []
    for meta in DOMAIN_METADATA:
        result.append({
            **meta,
            "article_count": counts_by_domain.get(meta["id"], 0),
        })
    return result


@router.get("/{domain_id}")
async def get_domain(domain_id: str):
    """Return detailed info for a single domain."""
    for meta in DOMAIN_METADATA:
        if meta["id"] == domain_id:
            # Get article count
            count = 0
            try:
                db = get_supabase()
                docs = (
                    db.table("documents")
                    .select("id")
                    .eq("domain", domain_id)
                    .execute()
                )
                count = len(docs.data)
            except Exception as e:
                print(f"[domains] Could not fetch count for {domain_id}: {e}")

            return {**meta, "article_count": count}

    raise HTTPException(status_code=404, detail=f"Domain '{domain_id}' not found")
