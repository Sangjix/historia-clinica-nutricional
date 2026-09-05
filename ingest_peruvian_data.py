import urllib.request
import csv
import io
import fitz
import re
import uuid
import sqlite3
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = "prisma/dev.db"
TPCA_URL = "https://raw.githubusercontent.com/SJacoboZavaleta/TablaAlimenticiaPeru2017/master/alimentos.csv"
TAFERA_PDF = "TAFERA_2016_VF.pdf"

# Grupos oficiales TPCA (CENAN / INS)
TPCA_GROUPS = {
    "A": "Cereales y derivados",
    "B": "Verduras, hortalizas y derivados",
    "C": "Frutas y derivados",
    "D": "Grasas, aceites y oleaginosas",
    "E": "Pescados y mariscos",
    "F": "Carnes y derivados",
    "G": "Leche y derivados",
    "H": "Bebidas (alcohólicas y analcohólicas)",
    "J": "Huevos y derivados",
    "K": "Productos azucarados",
    "L": "Misceláneos",
    "Q": "Alimentos infantiles",
    "T": "Leguminosas y derivados",
    "U": "Tubérculos, raíces y derivados",
    "S": "Alimentos preparados"
}

# Grupos oficiales TAFERA (CENAN / INS 2016)
TAFERA_GROUPS = {
    1: "Cereales y derivados",
    2: "Verduras, hortalizas y derivados",
    3: "Frutas y derivados",
    4: "Grasas, aceites y oleaginosas",
    5: "Pescados y mariscos",
    6: "Carnes y derivados",
    7: "Leches y derivados",
    8: "Huevos y derivados",
    9: "Productos azucarados",
    10: "Misceláneos",
    11: "Leguminosas y derivados",
    12: "Tubérculos, raíces y derivados"
}

def clean_num(val):
    if val is None:
        return None
    s = str(val).strip().replace(".", "").replace(",", ".")
    s = re.sub(r'[^\d.]+', '', s)
    if not s:
        return None
    try:
        return float(s)
    except:
        return None

def clean_text(text):
    if not text:
        return ""
    # Quitar símbolos de notas al pie en TAFERA
    t = re.sub(r'[\*\α\π\β\µ\Ω\+]+', '', str(text))
    return " ".join(t.replace("\n", " ").split()).strip()

def main():
    print("==================================================")
    print("🚀 INICIANDO INGESTA DE TABLAS NUTRICIONALES PERUANAS")
    print("   1. Tabla Peruana de Composición de Alimentos (TPCA - CENAN/INS)")
    print("   2. TAFERA 2016 VF (Porciones de consumo y Factores de Conversión)")
    print("==================================================")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # -------------------------------------------------------------
    # 1. INGESTA DE TPCA (928 ALIMENTOS)
    # -------------------------------------------------------------
    print("\n📦 Paso 1: Descargando y procesando TPCA 2017...")
    req = urllib.request.Request(TPCA_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        raw_csv = resp.read().decode('utf-8', errors='replace')

    reader = csv.reader(io.StringIO(raw_csv))
    header = next(reader)
    print(f"   Columnas TPCA detectadas: {header[:6]}...")

    cursor.execute("DELETE FROM PeruvianFood;")
    
    tpca_rows = []
    for r in reader:
        if not r or len(r) < 10:
            continue
        group_code = r[0].strip().upper()
        num = r[1].strip()
        code = f"{group_code}-{num}"
        name = clean_text(r[2])
        group_name = TPCA_GROUPS.get(group_code, "Otros alimentos peruanos")

        energy_kcal = clean_num(r[3]) or 0.0
        energy_kj = clean_num(r[4])
        water_g = clean_num(r[5])
        protein_g = clean_num(r[6]) or 0.0
        fat_g = clean_num(r[7]) or 0.0
        carbs_g = clean_num(r[9]) or clean_num(r[8]) or 0.0
        fiber_g = clean_num(r[10])
        ash_g = clean_num(r[11])
        calcium_mg = clean_num(r[12])
        phosphorus_mg = clean_num(r[13])
        zinc_mg = clean_num(r[14])
        iron_mg = clean_num(r[15])
        vit_a_ug = clean_num(r[17])
        thiamine_mg = clean_num(r[18]) if len(r) > 18 else None
        riboflavin_mg = clean_num(r[19]) if len(r) > 19 else None
        niacin_mg = clean_num(r[20]) if len(r) > 20 else None
        vit_c_mg = clean_num(r[21]) if len(r) > 21 else None
        folic_ug = clean_num(r[22]) if len(r) > 22 else None
        sodium_mg = clean_num(r[23]) if len(r) > 23 else None
        potassium_mg = clean_num(r[24]) if len(r) > 24 else None

        tpca_rows.append((
            str(uuid.uuid4()), code, group_code, group_name, name,
            energy_kcal, energy_kj, water_g, protein_g, fat_g, carbs_g,
            fiber_g, ash_g, calcium_mg, phosphorus_mg, zinc_mg, iron_mg,
            vit_a_ug, thiamine_mg, riboflavin_mg, niacin_mg, vit_c_mg,
            folic_ug, sodium_mg, potassium_mg
        ))

    cursor.executemany("""
        INSERT INTO PeruvianFood (
            id, code, groupCode, groupName, name,
            energyKcal, energyKj, waterG, proteinG, fatG, carbsG,
            fiberG, ashG, calciumMg, phosphorusMg, zincMg, ironMg,
            vitaminAUg, thiamineMg, riboflavinMg, niacinMg, vitaminCMg,
            folicAcidUg, sodiumMg, potassiumMg
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, tpca_rows)
    conn.commit()
    print(f"   ✓ {len(tpca_rows)} alimentos peruanos oficiales (TPCA) insertados correctamente.")

    # -------------------------------------------------------------
    # 2. INGESTA DE TAFERA 2016 VF - MÓDULO I (PORCIONES)
    # -------------------------------------------------------------
    print("\n📦 Paso 2: Procesando Módulo I de TAFERA 2016 VF (Medidas Caseras y Porciones)...")
    if not os.path.exists(TAFERA_PDF):
        print("   Descargando TAFERA PDF...")
        pdf_url = "https://cdn.www.gob.pe/uploads/document/file/1427367/TAFERA%202016%20VF.pdf.pdf"
        urllib.request.urlretrieve(pdf_url, TAFERA_PDF)

    doc = fitz.open(TAFERA_PDF)
    cursor.execute("DELETE FROM TaferaFoodPortion;")

    tafera_portions = []
    current_food = ""

    for page_idx in range(13, 74):
        page = doc[page_idx]
        
        # Palabras en columna alimento
        words = page.get_text("words")
        food_words = [w for w in words if 45 <= w[0] <= 105 and w[1] > 95 and not re.match(r'^\d+-\d+$', w[4]) and w[4] not in ['ALIMENTO', 'COD.', 'g', 'mg', 'kcal']]
        food_words.sort(key=lambda w: (w[1], w[0]))
        
        food_lines = []
        curr_l = []
        last_y = -999
        for w in food_words:
            if w[1] - last_y > 18:
                if curr_l:
                    food_lines.append(" ".join(curr_l))
                curr_l = [w[4]]
            else:
                curr_l.append(w[4])
            last_y = w[1]
        if curr_l:
            food_lines.append(" ".join(curr_l))

        tabs = page.find_tables()
        for tab in tabs.tables:
            rows = tab.extract()
            for r in rows:
                if not r or len(r) < 5:
                    continue
                code = str(r[0]).strip() if r[0] else ""
                m = re.match(r'^(\d+)-(\d+)$', code)
                if not m:
                    continue
                
                group_num = int(m.group(1))
                group_name = TAFERA_GROUPS.get(group_num, "Otros")
                
                food_cell = clean_text(r[1])
                if food_cell and len(food_cell) > 2:
                    current_food = food_cell
                elif food_lines and (not current_food or len(current_food) < 3):
                    current_food = clean_text(food_lines[0])

                measure = clean_text(r[2])
                gross_weight = clean_num(r[3])
                net_weight = clean_num(r[4]) or gross_weight or 100.0

                nutr_tokens = str(r[5] or "").strip().split()
                energy = clean_num(nutr_tokens[0]) if len(nutr_tokens) > 0 else clean_num(r[5])
                protein = clean_num(nutr_tokens[1]) if len(nutr_tokens) > 1 else clean_num(r[6] if len(r) > 6 else None)
                fat = clean_num(nutr_tokens[2]) if len(nutr_tokens) > 2 else clean_num(r[7] if len(r) > 7 else None)
                carbs = clean_num(nutr_tokens[3]) if len(nutr_tokens) > 3 else clean_num(r[8] if len(r) > 8 else None)
                fiber = clean_num(nutr_tokens[4]) if len(nutr_tokens) > 4 else clean_num(r[9] if len(r) > 9 else None)
                calcium = clean_num(nutr_tokens[5]) if len(nutr_tokens) > 5 else clean_num(r[10] if len(r) > 10 else None)
                zinc = clean_num(nutr_tokens[6]) if len(nutr_tokens) > 6 else clean_num(r[11] if len(r) > 11 else None)
                iron = clean_num(nutr_tokens[7]) if len(nutr_tokens) > 7 else clean_num(r[12] if len(r) > 12 else None)
                vit_a = clean_num(nutr_tokens[8]) if len(nutr_tokens) > 8 else clean_num(r[13] if len(r) > 13 else None)
                vit_c = clean_num(nutr_tokens[9]) if len(nutr_tokens) > 9 else clean_num(r[14] if len(r) > 14 else None)

                edible_pct = clean_num(r[-1])

                tafera_portions.append((
                    str(uuid.uuid4()), code, group_num, group_name,
                    current_food, measure, gross_weight, net_weight,
                    edible_pct, energy or 0.0, protein or 0.0, fat or 0.0,
                    carbs or 0.0, fiber, calcium, zinc, iron, vit_a, vit_c
                ))

    cursor.executemany("""
        INSERT INTO TaferaFoodPortion (
            id, code, groupNumber, groupName,
            foodName, householdMeasure, grossWeightG, netWeightG,
            ediblePercentage, energyKcal, proteinG, fatG,
            carbsG, fiberG, calciumMg, zincMg, ironMg, vitaminAUg, vitaminCMg
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, tafera_portions)
    conn.commit()
    print(f"   ✓ {len(tafera_portions)} porciones y medidas caseras de TAFERA 2016 VF insertadas correctamente.")

    # -------------------------------------------------------------
    # 3. INGESTA DE TAFERA 2016 VF - MÓDULO II (FACTORES DE CONVERSIÓN)
    # -------------------------------------------------------------
    print("\n📦 Paso 3: Procesando Factores de Conversión Cocido a Crudo (Módulo II)...")
    cursor.execute("DELETE FROM TaferaConversionFactor;")
    
    fc_rows = []
    current_fc_group = "Cereales y derivados"
    current_fc_food = ""

    for p_idx in range(76, 85):
        page = doc[p_idx]
        tabs = page.find_tables()
        for tab in tabs.tables:
            rows = tab.extract()
            for r in rows:
                if not r or len(r) < 3:
                    continue
                # Descartar cabeceras
                row_str = " ".join(str(c or "") for c in r)
                if "GRUPO" in row_str or "FACTOR" in row_str or "PERÚ" in row_str:
                    continue
                
                # Grupo
                g_cell = clean_text(r[0])
                if g_cell and len(g_cell) > 3 and not re.match(r'^\d', g_cell):
                    current_fc_group = g_cell
                
                # Food
                f_idx = 2 if len(r) >= 5 else 1 if len(r) >= 4 else 0
                f_cell = clean_text(r[f_idx])
                if f_cell and len(f_cell) > 2 and not clean_num(f_cell):
                    current_fc_food = f_cell
                
                # Cooking type & factor
                cook_cell = clean_text(r[-2]) if len(r) >= 4 else "Sancochado"
                factor = clean_num(r[-1])
                
                if current_fc_food and factor and factor > 0:
                    fc_rows.append((
                        str(uuid.uuid4()), current_fc_group,
                        current_fc_food, cook_cell, factor
                    ))

    cursor.executemany("""
        INSERT INTO TaferaConversionFactor (
            id, groupName, foodName, cookingType, factor
        ) VALUES (?, ?, ?, ?, ?);
    """, fc_rows)
    conn.commit()
    print(f"   ✓ {len(fc_rows)} factores de conversión de cocción insertados correctamente.")

    conn.close()
    print("\n==================================================")
    print("🎉 INGESTA COMPLETADA EXITOSAMENTE:")
    print(f"   - {len(tpca_rows)} alimentos TPCA 2017 (CENAN/INS)")
    print(f"   - {len(tafera_portions)} porciones y medidas caseras TAFERA 2016 VF")
    print(f"   - {len(fc_rows)} factores de conversión cocido a crudo")
    print("==================================================")

if __name__ == "__main__":
    main()
