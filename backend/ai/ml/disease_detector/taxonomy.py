DISEASE_CATALOG = {
    "tomato_early_blight": {
        "crop": "Tomato",
        "disease_name": "Early Blight",
        "pathogen_type": "Fungal (Alternaria solani)",
        "severity_level": "Moderate",
        "symptoms": "Concentric dark brown rings on older leaves forming a target-board appearance.",
        "symptom_keys": {"brown_spots", "concentric_rings", "yellowing_lower_leaves"},
        "chemical_control": {
            "active_ingredient": "Mancozeb 75% WP or Chlorothalonil 75% WP",
            "commercial_names": ["Indofil M-45", "Kavach"],
            "dosage_per_acre": "2.0 - 2.5 g per litre of water",
            "application_instructions": "Repeat at 10-14 day intervals upon symptom appearance.",
            "withholding_period_days": 7,
        },
        "organic_biological_control": {
            "solution": "Neem seed kernel extract 5% or Trichoderma harzianum foliar spray @ 5g/L",
            "frequency": "Every 7 days during high humidity",
        },
        "preventive_measures": [
            "Prune infected lower leaves and destroy them away from field",
            "Avoid overhead irrigation; use drip to keep foliage dry",
            "Rotate with non-solanaceous crops for 2 seasons",
        ],
        "store_recommendations": [
            {
                "category": "Fungicide",
                "search_term": "Mancozeb",
                "display_name": "Mancozeb 75% WP Contact Fungicide",
            }
        ],
    },
    "tomato_late_blight": {
        "crop": "Tomato",
        "disease_name": "Late Blight",
        "pathogen_type": "Oomycete (Phytophthora infestans)",
        "severity_level": "High",
        "symptoms": "Irregular water-soaked greenish-black blotches on leaves with white downy growth underneath.",
        "symptom_keys": {"water_soaked_spots", "white_cottony_mildew", "brown_spots"},
        "chemical_control": {
            "active_ingredient": "Cymoxanil 8% + Mancozeb 64% WP or Metalaxyl-M + Mancozeb",
            "commercial_names": ["Curzate M8", "Ridomil Gold"],
            "dosage_per_acre": "2.0 - 2.5 g per litre of water",
            "application_instructions": "Spray immediately upon cool humid outbreak; repeat at 7-10 day intervals.",
            "withholding_period_days": 10,
        },
        "organic_biological_control": {
            "solution": "Copper oxychloride 50% WP @ 2.5 g/L or Bacillus subtilis foliar bioprotectant",
            "frequency": "Every 7 days during wet conditions",
        },
        "preventive_measures": [
            "Avoid evening overhead irrigation and improve canopy airflow",
            "Remove infected plants early to stop sporangia spread",
            "Use disease-free transplants and staking",
        ],
        "store_recommendations": [
            {
                "category": "Fungicide",
                "search_term": "Mancozeb",
                "display_name": "Mancozeb / Cymoxanil Blight Control",
            }
        ],
    },
    "rice_brown_spot": {
        "crop": "Rice",
        "disease_name": "Brown Spot",
        "pathogen_type": "Fungal (Bipolaris oryzae)",
        "severity_level": "Moderate",
        "symptoms": "Oval brown leaf lesions with grey centers, common under nutrient stress.",
        "symptom_keys": {"brown_spots", "oval_lesions", "grain_discoloration"},
        "chemical_control": {
            "active_ingredient": "Propiconazole 25% EC",
            "commercial_names": ["Tilt", "Bumper"],
            "dosage_per_acre": "200 ml in 200 L water",
            "application_instructions": "Spray at first lesion appearance and repeat after 12-15 days if needed.",
            "withholding_period_days": 15,
        },
        "organic_biological_control": {
            "solution": "Pseudomonas fluorescens seed treatment and foliar spray",
            "frequency": "At nursery and early tillering stage",
        },
        "preventive_measures": [
            "Use balanced potassium and nitrogen nutrition",
            "Avoid water stress",
            "Use disease-free seed",
        ],
        "store_recommendations": [
            {"category": "Fungicide", "search_term": "Propiconazole", "display_name": "Propiconazole 25% EC"}
        ],
    },
    "rice_leaf_blast": {
        "crop": "Rice",
        "disease_name": "Leaf Blast",
        "pathogen_type": "Fungal (Magnaporthe oryzae)",
        "severity_level": "High",
        "symptoms": "Diamond- or spindle-shaped lesions with greyish centers and dark brown borders on rice leaves.",
        "symptom_keys": {"oval_lesions", "brown_spots"},
        "chemical_control": {
            "active_ingredient": "Tricyclazole 75% WP or Isoprothiolane 40% EC",
            "commercial_names": ["Beam", "Fuji-One"],
            "dosage_per_acre": "0.6 g/L (Tricyclazole) in 200 L water",
            "application_instructions": "Spray at initial spindle lesion stage and again at booting if humid.",
            "withholding_period_days": 21,
        },
        "organic_biological_control": {
            "solution": "Pseudomonas fluorescens @ 10 g/L foliar spray and silicon-enriched compost",
            "frequency": "Every 10 days during tillering",
        },
        "preventive_measures": [
            "Avoid excessive nitrogen top-dressing",
            "Maintain consistent standing moisture rather than intermittent drought",
            "Remove grassy weed hosts around bunds",
        ],
        "store_recommendations": [
            {"category": "Fungicide", "search_term": "Tricyclazole", "display_name": "Tricyclazole 75% WP Blast Fungicide"}
        ],
    },
    "wheat_yellow_rust": {
        "crop": "Wheat",
        "disease_name": "Yellow Rust",
        "pathogen_type": "Fungal (Puccinia striiformis)",
        "severity_level": "High",
        "symptoms": "Yellow-orange powdery stripes arranged along leaf veins.",
        "symptom_keys": {"yellow_rust_stripes", "powder_on_leaves", "linear_pustules", "yellow_pustules"},
        "chemical_control": {
            "active_ingredient": "Propiconazole 25% EC or Tebuconazole 25.9% EC",
            "commercial_names": ["Tilt", "Folicur"],
            "dosage_per_acre": "200 ml in 200 L water",
            "application_instructions": "Spray immediately after symptoms cross economic threshold.",
            "withholding_period_days": 30,
        },
        "organic_biological_control": {
            "solution": "Use resistant varieties and balanced nitrogen; biological sprays have limited curative effect.",
            "frequency": "Preventive crop planning stage",
        },
        "preventive_measures": [
            "Grow rust-resistant varieties",
            "Avoid excessive nitrogen",
            "Monitor cool humid weather windows",
        ],
        "store_recommendations": [
            {"category": "Fungicide", "search_term": "Tebuconazole", "display_name": "Tebuconazole EC"}
        ],
    },
    "potato_early_blight": {
        "crop": "Potato",
        "disease_name": "Early Blight",
        "pathogen_type": "Fungal (Alternaria solani)",
        "severity_level": "Moderate",
        "symptoms": "Dark brown necrotic spots with concentric target rings bordered by yellow chlorotic tissue.",
        "symptom_keys": {"brown_spots", "concentric_rings", "yellowing_lower_leaves"},
        "chemical_control": {
            "active_ingredient": "Mancozeb 75% WP or Azoxystrobin + Difenoconazole",
            "commercial_names": ["Indofil M-45", "Amistar Top"],
            "dosage_per_acre": "2.0 g/L (Mancozeb) or 1 ml/L (Amistar Top)",
            "application_instructions": "Spray at 10-12 day intervals starting at early canopy lesion detection.",
            "withholding_period_days": 14,
        },
        "organic_biological_control": {
            "solution": "Trichoderma viride / Neem oil 3% foliar spray",
            "frequency": "Every 7-10 days",
        },
        "preventive_measures": [
            "Use certified disease-free seed tubers",
            "Ensure adequate potassium and nitrogen balance",
            "Avoid overhead irrigation late in the afternoon",
        ],
        "store_recommendations": [
            {"category": "Fungicide", "search_term": "Mancozeb", "display_name": "Mancozeb 75% WP"}
        ],
    },
    "potato_late_blight": {
        "crop": "Potato",
        "disease_name": "Late Blight",
        "pathogen_type": "Oomycete (Phytophthora infestans)",
        "severity_level": "High",
        "symptoms": "Dark water-soaked leaf lesions spreading rapidly with pale green halos and white underside mold.",
        "symptom_keys": {"water_soaked_spots", "white_cottony_mildew", "brown_spots"},
        "chemical_control": {
            "active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP or Cymoxanil + Mancozeb",
            "commercial_names": ["Ridomil Gold", "Curzate M8"],
            "dosage_per_acre": "2.5 g per litre of water",
            "application_instructions": "Spray immediately during cool cloudy weather; repeat every 7-10 days.",
            "withholding_period_days": 14,
        },
        "organic_biological_control": {
            "solution": "Copper hydroxide / Copper oxychloride 50% WP @ 2.5 g/L preventive barrier",
            "frequency": "Every 7 days before rain/fog windows",
        },
        "preventive_measures": [
            "Destroy cull piles and volunteer potato shoots",
            "Hill ridges properly to protect tubers from spores",
            "Monitor cool humid weather alerts",
        ],
        "store_recommendations": [
            {"category": "Fungicide", "search_term": "Mancozeb", "display_name": "Blight Control Fungicide"}
        ],
    },
    "maize_leaf_blight": {
        "crop": "Maize",
        "disease_name": "Turcicum Leaf Blight",
        "pathogen_type": "Fungal (Exserohilum turcicum)",
        "severity_level": "Moderate",
        "symptoms": "Long, elliptical greyish-green to tan cigar-shaped lesions parallel to leaf margins.",
        "symptom_keys": {"oval_lesions", "brown_spots"},
        "chemical_control": {
            "active_ingredient": "Mancozeb 75% WP or Azoxystrobin 23% SC",
            "commercial_names": ["Dithane M-45", "Amistar"],
            "dosage_per_acre": "2.0 g/L (Mancozeb) in 200 L water",
            "application_instructions": "Apply at early knee-high or tasseling if lower leaves show spreading lesions.",
            "withholding_period_days": 15,
        },
        "organic_biological_control": {
            "solution": "Trichoderma harzianum soil & foliar enrichment",
            "frequency": "At 25 and 45 DAS",
        },
        "preventive_measures": [
            "Rotate maize with legumes or oilseeds",
            "Plow under infected crop residue post-harvest",
            "Plant tolerant maize hybrids",
        ],
        "store_recommendations": [
            {"category": "Fungicide", "search_term": "Mancozeb", "display_name": "Mancozeb 75% WP"}
        ],
    },
    "cotton_bacterial_blight": {
        "crop": "Cotton",
        "disease_name": "Bacterial Blight (Angular Leaf Spot)",
        "pathogen_type": "Bacterial (Xanthomonas citri pv. malvacearum)",
        "severity_level": "Moderate",
        "symptoms": "Angular water-soaked leaf spots bounded by veins turning dark brown to black.",
        "symptom_keys": {"water_soaked_spots", "brown_spots"},
        "chemical_control": {
            "active_ingredient": "Copper Oxychloride 50% WP + Streptocycline (if permitted locally)",
            "commercial_names": ["Blitox 50", "Blue Copper"],
            "dosage_per_acre": "2.5 g/L Copper Oxychloride",
            "application_instructions": "Spray at initial angular spot appearance after rain; repeat at 12-15 days.",
            "withholding_period_days": 10,
        },
        "organic_biological_control": {
            "solution": "Pseudomonas fluorescens @ 10 g/L foliar spray",
            "frequency": "Every 10 days",
        },
        "preventive_measures": [
            "Use acid-delinted disease-free cotton seed",
            "Avoid working in wet fields to limit mechanical spread",
            "Destroy infected plant debris after harvest",
        ],
        "store_recommendations": [
            {"category": "Bactericide", "search_term": "Copper", "display_name": "Copper Oxychloride 50% WP"}
        ],
    },
}


def healthy_response(crop_name: str, observed_signs: str = "") -> dict:
    return {
        "status": "healthy",
        "crop": crop_name or "Crop Leaf",
        "disease": "Healthy Foliage (No Disease Detected)",
        "pathogen": "None Detected",
        "severity": "Healthy",
        "clinical_symptoms": observed_signs or "Foliage appears green and intact with no characteristic fungal, bacterial, or viral lesions.",
        "treatment": {
            "chemical": {},
            "organic": {
                "remedy": "No curative fungicide or bactericide needed. Continue routine preventive scouting.",
                "frequency": "Weekly field inspection",
            },
            "cultural_practices": [
                "Maintain balanced NPK fertilization and proper drainage",
                "Inspect lower leaf undersides weekly after irrigation or rain",
            ],
        },
        "store_recommendations": [],
    }


def treatment_response(key: str, confidence: float) -> dict:
    item = DISEASE_CATALOG[key]
    return {
        "crop": item["crop"],
        "disease": item["disease_name"],
        "pathogen": item["pathogen_type"],
        "severity": item["severity_level"],
        "confidence": round(confidence, 4),
        "clinical_symptoms": item["symptoms"],
        "treatment": {
            "chemical": {
                "active_ingredient": item["chemical_control"]["active_ingredient"],
                "recommended_products": item["chemical_control"]["commercial_names"],
                "dosage": item["chemical_control"]["dosage_per_acre"],
                "spray_interval": item["chemical_control"]["application_instructions"],
                "withholding_period_days": item["chemical_control"]["withholding_period_days"],
            },
            "organic": {
                "remedy": item["organic_biological_control"]["solution"],
                "frequency": item["organic_biological_control"]["frequency"],
            },
            "cultural_practices": item["preventive_measures"],
        },
        "store_recommendations": item["store_recommendations"],
    }
