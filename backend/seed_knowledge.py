"""
KeralaGPT — Knowledge Base Seeder
Seeds all 8 cultural domains with rich, factual content.
Run: python seed_knowledge.py
"""
import asyncio
import sys
import os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, os.path.dirname(__file__))

from app.services.ingestion.ingestor import ingest_document

SEED_DATA = [
    # ══════════════════════════════════════════════════════════
    # DOMAIN 1: PERFORMING ARTS
    # ══════════════════════════════════════════════════════════
    {
        "title": "Kathakali — The Classical Dance-Drama of Kerala",
        "domain": "performing-arts",
        "credibility_tier": "curated",
        "author": "KeralaGPT Seed",
        "content": """Kathakali is one of the most renowned classical dance-drama forms from Kerala, India. Originating in the 17th century, it is a synthesis of dance, music, acting, and elaborate costuming. The art form evolved from earlier traditions like Krishnanattam and Ramanattam.

Kathakali performances are traditionally held in temple courtyards and open-air stages. The performers use elaborate face makeup called chutti, which takes hours to apply. The makeup colors signify character types: green (paccha) for noble heroes, red-bearded (chuvanna thaadi) for villains, and black (kari) for demonesses.

The art form uses a codified system of hand gestures called mudras, derived from Hastalakshana Deepika, numbering 24 basic mudras and hundreds of combinations. Facial expressions (navarasas — nine emotions) are central to the storytelling.

Musical accompaniment includes the chenda (cylindrical drum), maddalam (barrel drum), chengila (gong), and ilathalam (cymbals). The vocalists sing in Sopana style, a melodic tradition unique to Kerala temples.

Major Kathakali stories are drawn from the Mahabharata, Ramayana, and Puranas. Famous plays include Nalacharitam, Duryodhanavadam, Kalyanasougandhikam, and Keechakavadham. The Kerala Kalamandalam, founded in 1930 by poet Vallathol Narayana Menon, is the premier institution for Kathakali training.

UNESCO has recognized Kathakali as a Masterpiece of the Oral and Intangible Heritage of Humanity. Modern practitioners include Kalamandalam Gopi, Kottakkal Sivaraman, and Sadanam Krishnankutty.""",
    },
    {
        "title": "Theyyam — The Living Gods of North Malabar",
        "domain": "performing-arts",
        "credibility_tier": "curated",
        "author": "KeralaGPT Seed",
        "content": """Theyyam is a spectacular ritualistic art form practiced in the northern districts of Kerala, particularly Kannur and Kasaragod. It is believed to predate Hinduism, with roots in ancient tribal worship and ancestor veneration. There are over 400 different Theyyams, each representing a deity, ancestor, or folk hero.

The performer, called a Theyyam Kolakkaran, undergoes elaborate preparation including fasting, prayer, and hours of makeup application. The costumes are extraordinary — towering headgear (mudi) up to 20 feet tall, face paintings in vivid red, yellow, and black, and ornate body decorations made from coconut fronds, flowers, and metals.

During the ritual, the performer enters a trance state and is believed to become the deity itself. Devotees seek blessings, healing, and resolution of disputes from the Theyyam. Key Theyyams include Muthappan (a folk deity popular across castes), Vishnumoorthi, Gulikan, Pottan Theyyam, and Kundor Chamundi.

Theyyam season runs from October to May. The performances take place in sacred groves called kavus and in front of households. Unlike classical art forms controlled by upper castes, Theyyam is primarily performed by Scheduled Caste and Scheduled Tribe communities, giving it a unique social dynamic where lower-caste performers are worshipped by all.

The art form faces challenges from urbanization and migration, but has seen a revival through tourism and cultural documentation efforts. The Theyyam belt of Malabar remains one of the most culturally rich regions in India.""",
    },
    {
        "title": "Mohiniyattam — The Dance of the Enchantress",
        "domain": "performing-arts",
        "credibility_tier": "curated",
        "author": "KeralaGPT Seed",
        "content": """Mohiniyattam is the classical solo dance form of Kerala, performed predominantly by women. The name derives from Mohini, the divine enchantress form of Lord Vishnu. It is characterized by graceful, swaying movements that mimic the gentle motion of coconut palms and ocean waves.

The dance evolved between the 16th and 19th centuries. Maharaja Swathi Thirunal of Travancore (1813-1846) was a major patron who composed many songs specifically for Mohiniyattam. The art form faced decline during British colonial rule but was revived in the 20th century by poet Vallathol Narayana Menon and dancer Kalamandalam Kalyanikutty Amma.

The costume is distinctive — a white and gold bordered Kerala sari (kasavu mundu), gold jewelry, jasmine flowers in the hair, and subtle makeup emphasizing the eyes. The dancer's movements are lasya (graceful and feminine), in contrast to the tandava (vigorous) style of Kathakali.

Mohiniyattam uses the Cholkettu rhythmic pattern and is performed to Carnatic music, with songs typically in Manipravalam — a literary blend of Malayalam and Sanskrit. The repertoire includes Cholkettu, Jatiswaram, Varnam, Padam, Thillana, and Shlokam.

Prominent Mohiniyattam artists include Sunanda Nair, Bharati Shivaji, Gopika Varma, and Neena Prasad. The Kerala Kalamandalam remains the premier training institution. In 2023, a Mohiniyattam festival drawing international participants was held at Thiruvananthapuram.""",
    },

    # ══════════════════════════════════════════════════════════
    # DOMAIN 2: LITERATURE
    # ══════════════════════════════════════════════════════════
    {
        "title": "Malayalam Literature — From Ramacharitam to Modern Masters",
        "domain": "literature",
        "credibility_tier": "curated",
        "author": "KeralaGPT Seed",
        "content": """Malayalam literature spans over a millennium, beginning with the earliest known work Ramacharitam (12th century), written in a proto-Malayalam-Tamil language. The literary tradition evolved through several distinct periods.

The Manipravalam period (13th-15th century) saw the emergence of a literary style blending Malayalam and Sanskrit. Key works include Unniyachi Charitam, Unnichiruthevi Charitam, and Chandrotsavam. This era produced Lilatilakam (1385), a treatise on grammar and poetics.

The Bhakti period produced towering poets like Thunchathu Ezhuthachan (16th century), revered as the Father of Malayalam Literature. His Adhyatma Ramayanam Kilippattu and Mahabharatam Kilippattu made the epics accessible in Malayalam. Cherusseri Namboothiri's Krishnagatha is another masterpiece from this era.

The modern era (19th-20th century) was revolutionary. Kumaran Asan, Vallathol Narayana Menon, and Ulloor S. Parameswara Iyer formed the poetic triumvirate (Kavithrayam). Asan's Veena Poovu (1907) is considered the first modern Malayalam poem.

In fiction, Chandu Menon's Indulekha (1889) was the first Malayalam novel. O.V. Vijayan's Khasakkinte Itihasam (The Legends of Khasak, 1969) is considered the greatest Malayalam novel. Vaikom Muhammad Basheer brought colloquial charm and humor. S.K. Pottekkatt, Thakazhi Sivasankara Pillai, and M.T. Vasudevan Nair are towering figures.

Kerala has produced the most Jnanpith Award winners per capita — including G. Sankara Kurup (1965, first winner), S.K. Pottekkatt (1980), Thakazhi (1984), M.T. Vasudevan Nair (1995), and O.N.V. Kurup (2007).""",
    },

    # ══════════════════════════════════════════════════════════
    # DOMAIN 3: HISTORY
    # ══════════════════════════════════════════════════════════
    {
        "title": "History of Kerala — From Ancient Kingdoms to Modern State",
        "domain": "history",
        "credibility_tier": "curated",
        "author": "KeralaGPT Seed",
        "content": """Kerala's history spans over 3,000 years, shaped by maritime trade, diverse rulers, and social reform movements.

Ancient Kerala was part of the Sangam-era Tamil kingdoms. The region was known as Keralam or Chera Nadu. The Chera dynasty ruled from Vanchi (likely modern Karur or Cranganore). The ancient port of Muziris (near modern Kodungallur) was a thriving international trade hub, trading spices, ivory, and gems with Romans, Arabs, Chinese, and Greeks. Pliny the Elder documented Roman trade with Muziris.

The medieval period saw the rise of the Zamorin (Samoothiri) of Calicut, the Kolathiri of Kannur, and the Kingdom of Travancore. Vasco da Gama arrived at Calicut in 1498, beginning the era of European colonization. The Portuguese, Dutch, and British successively established trading posts and forts.

Tipu Sultan of Mysore invaded Malabar in the 1780s-90s, causing significant upheaval. The Pazhassi Raja of Kottayam led guerrilla resistance against both Tipu and the British.

The Kingdom of Travancore under Marthanda Varma (1729-1758) became the dominant power in southern Kerala. His successor Dharma Raja and the famous Dewan Velu Thampi Dalawa resisted British expansion.

Social reform movements transformed Kerala in the 19th-20th centuries. Sree Narayana Guru's "One Caste, One Religion, One God" movement challenged caste discrimination. Ayyankali fought for Dalit rights. The Vaikom Satyagraha (1924-25) opened temple roads to all castes.

Kerala state was formed on November 1, 1956, merging Travancore-Cochin and Malabar. In 1957, Kerala elected the world's first democratically chosen communist government under E.M.S. Namboodiripad. The Kerala Model of development — high literacy, healthcare, and social indicators despite low per-capita income — became internationally recognized.""",
    },

    # ══════════════════════════════════════════════════════════
    # DOMAIN 4: TEMPLE ARCHITECTURE
    # ══════════════════════════════════════════════════════════
    {
        "title": "Kerala Temple Architecture — Sacred Spaces of God's Own Country",
        "domain": "temple-arch",
        "credibility_tier": "curated",
        "author": "KeralaGPT Seed",
        "content": """Kerala temple architecture is a distinct architectural style unique to the Indian subcontinent, shaped by the region's tropical climate, abundant timber, and cultural traditions.

The Kerala temple style features sloping roofs with copper or tile sheeting, designed for heavy monsoon rainfall. Temples are built using granite for foundations and walls, with superstructures in teak and rosewood. The typical layout includes a Sreekovil (sanctum sanctorum) — often circular, square, or apsidal — surrounded by concentric enclosures called Nalambalam (four-sided cloister) and Vilakkumadam.

The Padmanabhaswamy Temple in Thiruvananthapuram is the wealthiest temple in the world, with treasures estimated at over $20 billion. Built in the Dravidian and Kerala styles, its seven-story gopuram and 365 carved granite pillars are architectural marvels. The reclining Vishnu idol inside is 18 feet long.

Vadakkunnathan Temple in Thrissur is a classic example of Kerala temple architecture, with its circular Sreekovil, stunning murals, and massive compound. The temple's murals depicting scenes from the Mahabharata are masterpieces.

Guruvayur Temple, dedicated to Krishna, is one of the most visited pilgrimage sites in India. Its unique architectural feature is the Koothambalam (temple theatre) where Chakyar Koothu and Koodiyattam performances are held.

Tharavadu mansions (ancestral homes) share architectural principles with temples — sloping roofs, central courtyards (nadumuttam), carved wooden pillars, and elaborate door frames. Famous Tharavadus include Mattancherry Palace (Dutch Palace) and Padmanabhapuram Palace, which has the world's largest Asian-style residential complex.

Key architectural elements include Kireedam (ornamental crown on rooftops), Thidappalli (kitchen structure), Koottampalam (theatre), and Kulam (temple tank). The tradition of Thachushastra (Kerala carpentry science) governs the construction techniques passed down through generations of master craftsmen called Asari.""",
    },

    # ══════════════════════════════════════════════════════════
    # DOMAIN 5: FESTIVALS
    # ══════════════════════════════════════════════════════════
    {
        "title": "Festivals and Rituals of Kerala",
        "domain": "festivals",
        "credibility_tier": "curated",
        "author": "KeralaGPT Seed",
        "content": """Kerala's festival calendar is extraordinarily rich, blending Hindu, Christian, and Muslim celebrations with unique regional traditions.

Onam is Kerala's national festival, celebrated for 10 days in the month of Chingam (August-September). It commemorates the mythical King Mahabali's annual visit from the netherworld. Celebrations include Pookalam (floral carpet designs), Onasadya (grand vegetarian feast with 26+ dishes served on banana leaf), Vallam Kali (snake boat races), Pulikali (tiger dance), and Kaikottikali (clap dance). The Aranmula Uthrattathi boat race is the oldest river boat race in India.

Vishu, celebrated on the first day of Medam (mid-April), marks the Malayalam New Year. The tradition of Vishukkani — an auspicious arrangement of rice, fruits, flowers, gold, cloth, and a mirror — is the first thing seen on Vishu morning. Vishukkaineettam (giving of money) and Vishu Sadya follow.

Thrissur Pooram, held at the Vadakkunnathan Temple, is the grandest temple festival in Kerala. Organized by Sakthan Thampuran in the 18th century, it features two rival processions — Paramekkavu and Thiruvambady — each with 15 caparisoned elephants, traditional orchestra ensembles (Panchavadyam and Panchari Melam), and a spectacular fireworks display that lights up the sky.

Other major festivals include Attukal Pongala (the world's largest gathering of women, Guinness record), Theyyam festivals in North Malabar, Nenmara Vallangi Vela, and the Aranmula boat race.

Christmas is widely celebrated, particularly in central Kerala. Eid and Milad-un-Nabi festivals are prominent in Malabar. The syncretic tradition is exemplified by the Arthunkal Perunnal (feast of St. Sebastian) attended by all communities.""",
    },

    # ══════════════════════════════════════════════════════════
    # DOMAIN 6: CUISINE
    # ══════════════════════════════════════════════════════════
    {
        "title": "Kerala Cuisine — The Spice Coast Kitchen",
        "domain": "cuisine",
        "credibility_tier": "curated",
        "author": "KeralaGPT Seed",
        "content": """Kerala cuisine is one of the most diverse regional cuisines in India, shaped by its coastal geography, spice trade heritage, and multicultural population.

The Sadhya (grand feast) is the centerpiece of Kerala cuisine. Served on a banana leaf, a traditional Sadhya includes 26 or more dishes: rice at the center, with avial (mixed vegetable curry with coconut), sambar, rasam, olan (ash gourd in coconut milk), kalan (raw banana in yogurt), thoran (vegetable stir-fry with coconut), pachadi, kichadi, pickles (naranga achar, manga achar), papadam, banana chips, payasam (dessert), and more. Pradhaman (kheer made with jaggery, coconut milk, and vermicelli or ada) is the quintessential Sadhya dessert.

Coconut is the soul of Kerala cooking. Coconut oil, coconut milk, grated coconut, and coconut cream appear in nearly every dish. The coconut palm is called Kalpavriksha (wish-fulfilling tree).

Kerala's spice heritage includes black pepper (the King of Spices, once worth its weight in gold), cardamom (Queen of Spices), cinnamon, cloves, turmeric, and nutmeg. Idukki and Wayanad are major spice-growing districts. The spice trade shaped Kerala's history, attracting traders from Rome, Arabia, China, and Europe for over 3,000 years.

Iconic dishes by community: Malabar Biryani (Muslim cuisine, with kaima rice and distinctive dum cooking), Fish Curry with Kokum (Syrian Christian specialty), Beef Fry and Kerala Porotta (universal street food), Appam with Stew (fermented rice pancakes with coconut milk curry), Puttu and Kadala Curry (steamed rice cylinders with chickpea curry — the quintessential Kerala breakfast), and Thalassery Biryani with its unique use of kaima/jeerakasala rice.

Toddy shops (kallu shaap) serve distinctive cuisine — Karimeen Pollichathu (pearl spot fish in banana leaf), Njandu Curry (crab curry), Koonthal Roast (squid roast), and Meen Moilee (fish in coconut milk). Toddy (kallu), the fermented sap of coconut palms, is the traditional beverage.""",
    },

    # ══════════════════════════════════════════════════════════
    # DOMAIN 7: CINEMA
    # ══════════════════════════════════════════════════════════
    {
        "title": "Malayalam Cinema — From New Wave to Global Recognition",
        "domain": "cinema",
        "credibility_tier": "curated",
        "author": "KeralaGPT Seed",
        "content": """Malayalam cinema, often called Mollywood, is one of India's most critically acclaimed film industries, known for its realistic storytelling, literary adaptations, and socially conscious themes.

The first Malayalam film was Vigathakumaran (1928), a silent film by J.C. Daniel. The first talkie was Balan (1938). The industry's golden age began in the 1970s with the New Wave movement, inspired by Italian Neorealism and French New Wave.

Adoor Gopalakrishnan is the most celebrated Malayalam filmmaker. His debut Swayamvaram (1972) launched the parallel cinema movement. Other landmark films include Elippathayam (1982, British Film Institute award), Mathilukal (1989), and Vidheyan (1993). He has won the Dadasaheb Phalke Award.

Aravindan's Kanchana Sita (1977), Thampu (1978), and Chidambaram (1985) are masterworks of Indian art cinema. G. Aravindan brought a painter's eye to filmmaking.

John Abraham was the most radical filmmaker — Agraharathil Kazhuthai (1977) and Amma Ariyan (1986), the latter made through public donations, are cult classics.

In mainstream cinema, Mammootty and Mohanlal dominated from the 1980s onward. Mammootty won three National Awards for Best Actor. Mohanlal's performances in Kireedam (1989), Bharatham (1991), and Vanaprastham (1999) are legendary.

The 2010s-2020s saw a renaissance: Dileesh Pothan's Maheshinte Prathikaaram (2016) and Thondimuthalum Driksakshiyum (2017), Lijo Jose Pellissery's Jallikattu (2019, India's Oscar entry), Blessy's Aadujeevitham (2024, based on Benyamin's novel), and Payal Kapadia's All We Imagine as Light (2024, Grand Prix at Cannes) represented a new golden era.

The industry produces approximately 200 films annually. The International Film Festival of Kerala (IFFK) held in Thiruvananthapuram is one of India's premier film festivals.""",
    },

    # ══════════════════════════════════════════════════════════
    # DOMAIN 8: GEOGRAPHY
    # ══════════════════════════════════════════════════════════
    {
        "title": "Geography and Nature of Kerala — God's Own Country",
        "domain": "geography",
        "credibility_tier": "curated",
        "author": "KeralaGPT Seed",
        "content": """Kerala, located on the southwestern Malabar Coast of India, is a narrow strip of land between the Western Ghats and the Arabian Sea. The state spans 38,863 sq km with a coastline of 580 km.

Kerala is divided into three geographical regions: the eastern highlands (Western Ghats, rising to 2,695m at Anamudi -- the highest peak in South India), the central midlands (undulating hills and valleys), and the western coastal lowlands (including the famous backwaters).

The Backwaters are Kerala's most iconic geographical feature -- a network of 1,500 km of interconnected canals, rivers, lakes, and inlets running parallel to the Arabian Sea coast. Major backwater destinations include Alappuzha (Alleppey), Kumarakom, Kollam, and Kochi. Vembanad Lake, at 2,033 sq km, is the largest lake in Kerala and India's longest lake. Houseboats (kettuvallam -- traditional rice barges converted for tourism) offer a unique way to explore the backwaters.

The Western Ghats, a UNESCO World Heritage Site, are one of the world's eight "hottest hotspots" of biological diversity. Kerala's portion includes Periyar Tiger Reserve, Silent Valley National Park (one of the last remaining tracts of virgin tropical evergreen forest), Eravikulam National Park (home to the endangered Nilgiri Tahr), and Wayanad Wildlife Sanctuary.

Kerala has 44 rivers, all originating in the Western Ghats and flowing westward into the Arabian Sea. The Periyar (244 km) is the longest river flowing entirely within Kerala. The Bharathapuzha (Nila) is the second longest and is culturally significant.

The monsoon defines Kerala's climate. The Southwest Monsoon arrives in Kerala first (June 1, called "monsoon onset over Kerala"), marking the beginning of India's rainy season. Kerala receives approximately 3,000 mm of rainfall annually.

Kerala has 14 districts: Thiruvananthapuram (capital), Kollam, Pathanamthitta, Alappuzha, Kottayam, Idukki, Ernakulam (commercial capital, includes Kochi), Thrissur (cultural capital), Palakkad, Malappuram, Kozhikode (Calicut), Wayanad, Kannur, and Kasaragod.

The state has a literacy rate of 96.2% (highest in India), life expectancy of 77 years, and a population of approximately 34 million. The "Kerala Model" of development is studied worldwide for achieving high social indicators with relatively low per-capita income.""",
    },
]


async def main():
    print("=" * 60)
    print("  KeralaGPT Knowledge Base Seeder")
    print("=" * 60)
    print(f"\n  Seeding {len(SEED_DATA)} documents across 8 domains...\n")

    success = 0
    failed = 0

    for i, doc in enumerate(SEED_DATA, 1):
        try:
            result = await ingest_document(
                title=doc["title"],
                content=doc["content"],
                domain=doc["domain"],
                credibility_tier=doc["credibility_tier"],
                author=doc.get("author"),
            )
            chunks = result.get("chunks_created", "?")
            print(f"  OK [{i}/{len(SEED_DATA)}] {doc['domain']:20s} - {doc['title'][:50]}  ({chunks} chunks)")
            success += 1
        except Exception as e:
            print(f"  FAIL [{i}/{len(SEED_DATA)}] {doc['domain']:20s} - ERROR: {e}")
            failed += 1

    print(f"\n{'=' * 60}")
    print(f"  Done! {success} succeeded, {failed} failed")
    print(f"  Domains covered: {len(set(d['domain'] for d in SEED_DATA))}/8")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    asyncio.run(main())
