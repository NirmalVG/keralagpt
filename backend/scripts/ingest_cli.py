"""
CLI tool for bulk ingestion.
Usage: python scripts/ingest_cli.py
"""
import asyncio
import sys
sys.path.append(".")  # run from backend/ directory

from app.services.ingestion.ingestor import ingest_document
from dotenv import load_dotenv
load_dotenv()

# Sample documents for initial knowledge base seeding
SAMPLE_DOCUMENTS = [
    {
        "title": "Theyyam — Divine Ritual Art of North Kerala",
        "domain": "performing-arts",
        "credibility_tier": "curated",
        "content": """Theyyam is a ritual art form of North Kerala, predominantly practiced
        in the Kannur and Kasaragod districts. The word Theyyam is derived from 'Daivam'
        meaning God. During a Theyyam performance, the performer is believed to be
        possessed by the deity and becomes a living god. There are over 400 forms of
        Theyyam, each representing a different deity or ancestral hero. The elaborate
        costume, headdress (Mudi), and makeup transform the performer into a divine being.
        The face painting uses natural colors — red from seeds, black from soot, white
        from rice flour. The headdress can stand up to 20 feet tall. Theyyam season
        runs from November to May in North Kerala. Unlike Kathakali which is performed
        on a stage, Theyyam is performed in the sacred groves (Kavus) and family shrines
        (Tharavads). The performance is deeply intertwined with the social fabric of
        North Kerala communities, often serving as a voice for the marginalized.""",
    },
    {
        "title": "Onam — Kerala Harvest Festival",
        "domain": "festivals",
        "credibility_tier": "official",
        "content": """Onam is the state festival of Kerala, celebrated with great fervor
        across all communities. It falls in the Malayalam month of Chingam (August-September)
        and marks the homecoming of the legendary King Mahabali. The festival spans
        ten days, with the most important being Thiruvonam. The elaborate flower carpet
        called Pookalam is the most visible symbol of Onam celebrations. Women and children
        arrange flowers in intricate concentric patterns in front of their homes each morning.
        The Onasadya, a vegetarian feast served on banana leaves, is central to the
        celebration. It consists of 26 traditional dishes including Avial, Sambar, Olan,
        Kalan, and Payasam. The Vallamkali snake boat race on the Punnamada Lake in
        Alappuzha is the most spectacular sporting event of Onam. Teams of over 100
        rowers compete in elaborately decorated snake boats called Chundan Vallams.
        Traditional games like Tug of War, Kabaddi, and Thumbi Thullal are played.
        Onam transcends religious boundaries — it is celebrated by Hindus, Christians,
        and Muslims of Kerala alike as a cultural identity festival.""",
    },
]


async def main():
    print(f"Starting bulk ingestion of {len(SAMPLE_DOCUMENTS)} documents...\n")
    for doc in SAMPLE_DOCUMENTS:
        print(f"Ingesting: {doc['title']}")
        result = await ingest_document(**doc)
        print(f"✓ {result['chunks_created']} chunks stored\n")
    print("Bulk ingestion complete.")


if __name__ == "__main__":
    asyncio.run(main())