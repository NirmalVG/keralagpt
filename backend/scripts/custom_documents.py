"""
Custom curated documents for domains where Wikipedia
articles are thin or missing important Kerala-specific detail.
Run after seed_knowledge_base.py.
"""
import asyncio
import sys
sys.path.append(".")
from dotenv import load_dotenv
load_dotenv()
from app.services.ingestion.ingestor import ingest_document

CUSTOM_DOCUMENTS = [
    {
        "title":            "Kalamandalam — Premier Institution of Kerala Classical Arts",
        "domain":           "sacred-arts",
        "credibility_tier": "official",
        "source_url":       "https://kalamandalam.ac.in",
        "content":          """Kerala Kalamandalam, deemed to be a University for Art and Culture,
        is an institution devoted to the promotion and propagation of the performing arts of Kerala.
        Established in 1930 by the poet Vallathol Narayana Menon, Kalamandalam was set up with the
        primary objective of preserving and promoting classical art forms of Kerala, especially
        Kathakali. The institution is located at Cheruthuruthy on the banks of the Bharathapuzha
        river in Thrissur district. Kalamandalam has been training students in Kathakali,
        Mohiniyattam, Koodiyattam, Thullal, Mridangam, Violin, and Carnatic Music. Students undergo
        rigorous training for 6 to 10 years under the Gurukula system of learning. The institution
        was granted Deemed University status by the University Grants Commission in 2006, making it
        the first performing arts institution in India to receive this recognition.""",
    },
    {
        "title":            "Kerala Sadya — The Grand Vegetarian Feast",
        "domain":           "cuisine",
        "credibility_tier": "curated",
        "content":          """A Sadya is a traditional Kerala vegetarian feast served on a banana
        leaf. The word Sadya means banquet in Malayalam. A traditional Sadya for festivals like Onam
        consists of rice and about 24 to 28 side dishes and desserts. The banana leaf is placed with
        the narrow end pointing to the left of the person eating. Rice is served first in the center,
        then the accompaniments are arranged around it. The dishes include Parippu (dal curry),
        Sambar, Rasam, Aviyal (mixed vegetables in coconut), Kaalan (yam and raw banana in curd),
        Olan (ash gourd in coconut milk), Erissery (pumpkin and lentils), Thoran (stir-fried
        vegetables with coconut), Kichadi (cucumber in curd), Pachadi (pineapple in curd), Injipuli
        (ginger-tamarind preserve), Naranga Achar (lime pickle), and two types of Payasam for
        dessert. The meal is eaten with the right hand only. Etiquette requires that the banana leaf
        be folded towards oneself after eating to signal satisfaction.""",
    },
]

async def main():
    print(f"Ingesting {len(CUSTOM_DOCUMENTS)} custom documents...\n")
    for doc in CUSTOM_DOCUMENTS:
        result = await ingest_document(**doc)
        print(f"✓ {result['title']} → {result['chunks_created']} chunks")

if __name__ == "__main__":
    asyncio.run(main())