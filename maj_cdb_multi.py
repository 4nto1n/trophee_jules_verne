#!/usr/bin/env python3
import os
import re
import argparse
import pandas as pd
import json

def parse_stage_filename(filename):
    """
    Parse a filename of the form "Trophee Jules Verne_VILLE1 - VILLE2.xls"
    Returns (ville1, ville2) or (None, None) if not matching.
    """
    base = os.path.basename(filename)
    name, ext = os.path.splitext(base)
    m = re.match(r"Trophee Jules Verne_(.+?)\s*-\s*(.+)", name, re.IGNORECASE)
    if m:
        ville1 = m.group(1).strip()
        ville2 = m.group(2).strip()
        return ville1, ville2
    else:
        return None, None

def read_metadata(metadata_path):
    """
    Read metadata JSON file, expecting a list of entries with keys:
    filename, ville1, ville2, pays, optionally numero.
    Returns list of entries.
    """
    with open(metadata_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("Metadata JSON must be a list of entries.")
    for entry in data:
        if "filename" not in entry or "ville1" not in entry or "ville2" not in entry or "pays" not in entry:
            raise ValueError("Each metadata entry must contain 'filename', 'ville1', 'ville2', 'pays'.")
    return data

def normalize_df(df):
    """
    Normalize DataFrame columns: strip whitespace and lower-case.
    """
    df = df.copy()
    df.columns = [str(col).strip().lower() for col in df.columns]
    return df

def find_sheet(xls_dict, sheet_name_lower):
    """
    Trouve une feuille dans xls_dict (keys) dont le nom correspond case-insensitive à sheet_name_lower.
    Retourne DataFrame ou None.
    """
    for key in xls_dict.keys():
        if key.strip().lower() == sheet_name_lower:
            return xls_dict[key]
    return None

def process_xls_file(input_dir, entry, output_dir):
    """
    Process a single XLS file with multiple sheets:
    - 'Stage results' -> etape_{num}_temps.json
    - 'General results' -> general_etape_{num}_temps.json
    - 'Points' -> general_etape_{num}_points.json
    - 'Mountain' -> general_etape_{num}_montagne.json
    - 'Team results' -> etape_{num}_equipe.json and general_etape_{num}_equipe.json
    - 'Young results' -> etape_{num}_jeune.json and general_etape_{num}_jeune.json
    """
    fname = entry["filename"]
    ville1 = entry.get("ville1", "")
    ville2 = entry.get("ville2", "")
    pays = entry.get("pays", "")
    full_path = os.path.join(input_dir, fname)
    if not os.path.isfile(full_path):
        print(f"Warning: file not found: {full_path}, skipping.")
        return

    try:
        xls = pd.read_excel(full_path, sheet_name=None, engine='xlrd')
    except Exception as e:
        print(f"Error reading {full_path}: {e}, skipping.")
        return

    num = entry.get("numero")
    if num is None:
        print(f"Warning: 'numero' not in metadata for file {fname}, skipping.")
        return
    num_str = str(num).zfill(2)

    # 1. Stage results
    sheet = find_sheet(xls, 'stage results')
    if sheet is not None:
        df = normalize_df(sheet)
        df = df.rename(columns={
            'rank': 'position',
            'name': 'nom',
            'team': 'equipe',
            'time': 'temps',
            'player': 'joueur'
        })
        keep_cols = [c for c in ['position', 'nom', 'equipe', 'temps', 'joueur'] if c in df.columns]
        if not keep_cols:
            print(f"Warning: No expected columns in 'Stage results' for file {fname}. Found: {df.columns.tolist()}")
        else:
            records = df[keep_cols].to_dict(orient='records')
            out = []
            for rec in records:
                try:
                    rec['position'] = int(rec.get('position'))
                except:
                    pass
                out.append(rec)
            out_path = os.path.join(output_dir, f"etape_{num_str}_temps.json")
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(out, f, ensure_ascii=False, indent=2)
            print(f"Wrote stage results to {out_path}")
    else:
        print(f"Warning: 'Stage results' sheet not found in {fname}")

    # 2. General results
    sheet = find_sheet(xls, 'general results')
    if sheet is not None:
        df = normalize_df(sheet)
        df = df.rename(columns={
            'rank': 'position',
            'name': 'nom',
            'team': 'equipe',
            'time': 'temps',
            'player': 'joueur'
        })
        keep_cols = [c for c in ['position', 'nom', 'equipe', 'temps', 'joueur'] if c in df.columns]
        if not keep_cols:
            print(f"Warning: No expected columns in 'General results' for file {fname}. Found: {df.columns.tolist()}")
        else:
            records = df[keep_cols].to_dict(orient='records')
            out = []
            for rec in records:
                try:
                    rec['position'] = int(rec.get('position'))
                except:
                    pass
                out.append(rec)
            out_path = os.path.join(output_dir, f"general_etape_{num_str}_temps.json")
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(out, f, ensure_ascii=False, indent=2)
            print(f"Wrote general results to {out_path}")
    else:
        print(f"Warning: 'General results' sheet not found in {fname}")

    # 3. Points sheet
    sheet = find_sheet(xls, 'points')
    if sheet is not None:
        df = normalize_df(sheet)
        df = df.rename(columns={
            'rank': 'position',
            'name': 'nom',
            'team': 'equipe',
            'points': 'points',
            'player': 'joueur'
        })
        keep_cols = [c for c in ['position', 'nom', 'equipe', 'points', 'joueur'] if c in df.columns]
        if not keep_cols:
            print(f"Warning: No expected columns in 'Points' for file {fname}. Found: {df.columns.tolist()}")
        else:
            records = df[keep_cols].to_dict(orient='records')
            out = []
            for rec in records:
                try:
                    rec['position'] = int(rec.get('position'))
                except:
                    pass
                try:
                    rec['points'] = int(rec.get('points'))
                except:
                    pass
                out.append(rec)
            out_path = os.path.join(output_dir, f"general_etape_{num_str}_points.json")
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(out, f, ensure_ascii=False, indent=2)
            print(f"Wrote points results to {out_path}")
    else:
        print(f"Warning: 'Points' sheet not found in {fname}")

    # 4. Mountain sheet
    sheet = find_sheet(xls, 'mountain')
    if sheet is not None:
        df = normalize_df(sheet)
        df = df.rename(columns={
            'rank': 'position',
            'name': 'nom',
            'team': 'equipe',
            'points': 'montagne',
            'player': 'joueur'
        })
        keep_cols = [c for c in ['position', 'nom', 'equipe', 'montagne', 'joueur'] if c in df.columns]
        if not keep_cols:
            print(f"Warning: No expected columns in 'Mountain' for file {fname}. Found: {df.columns.tolist()}")
        else:
            records = df[keep_cols].to_dict(orient='records')
            out = []
            for rec in records:
                try:
                    rec['position'] = int(rec.get('position'))
                except:
                    pass
                try:
                    rec['montagne'] = int(rec.get('montagne'))
                except:
                    pass
                out.append(rec)
            out_path = os.path.join(output_dir, f"general_etape_{num_str}_montagne.json")
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(out, f, ensure_ascii=False, indent=2)
            print(f"Wrote mountain results to {out_path}")
    else:
        print(f"Warning: 'Mountain' sheet not found in {fname}")

    # 5. Team results sheet
    sheet = find_sheet(xls, 'team results')
    if sheet is not None:
        df = normalize_df(sheet)
        # Stage team results
        df_stage = df.rename(columns={
            'rank': 'position',
            'team': 'equipe',
            'time': 'temps',
            'player': 'joueur'
        })
        keep_cols_stage = [c for c in ['position', 'equipe', 'temps', 'joueur'] if c in df_stage.columns]
        if keep_cols_stage:
            records = df_stage[keep_cols_stage].to_dict(orient='records')
            out = []
            for rec in records:
                try:
                    rec['position'] = int(rec.get('position'))
                except:
                    pass
                out.append(rec)
            out_path = os.path.join(output_dir, f"etape_{num_str}_equipe.json")
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(out, f, ensure_ascii=False, indent=2)
            print(f"Wrote stage team results to {out_path}")
        else:
            print(f"Warning: No expected columns for stage team results in {fname}. Found: {df.columns.tolist()}")
        # General team results
        if 'general time' in df.columns:
            df_gen = df.rename(columns={
                'rank': 'position',
                'team': 'equipe',
                'general time': 'temps',
                'player': 'joueur'
            })
            keep_cols_gen = [c for c in ['position', 'equipe', 'temps', 'joueur'] if c in df_gen.columns]
            if keep_cols_gen:
                records = df_gen[keep_cols_gen].to_dict(orient='records')
                out = []
                for rec in records:
                    try:
                        rec['position'] = int(rec.get('position'))
                    except:
                        pass
                    out.append(rec)
                out_path = os.path.join(output_dir, f"general_etape_{num_str}_equipe.json")
                with open(out_path, 'w', encoding='utf-8') as f:
                    json.dump(out, f, ensure_ascii=False, indent=2)
                print(f"Wrote general team results to {out_path}")
            else:
                print(f"Warning: No expected columns for general team results in {fname}. Found: {df.columns.tolist()}")
        else:
            print(f"Warning: 'General Time' column not found for general team in {fname}.")
    else:
        print(f"Warning: 'Team results' sheet not found in {fname}")

    # 6. Young results sheet
    sheet = find_sheet(xls, 'young results')
    if sheet is not None:
        df = normalize_df(sheet)
        # Stage young results
        df_stage = df.rename(columns={
            'rank': 'position',
            'name': 'nom',
            'team': 'equipe',
            'time': 'jeune',
            'player': 'joueur'
        })
        keep_cols_stage = [c for c in ['position', 'nom', 'equipe', 'jeune', 'joueur'] if c in df_stage.columns]
        if keep_cols_stage:
            records = df_stage[keep_cols_stage].to_dict(orient='records')
            out = []
            for rec in records:
                try:
                    rec['position'] = int(rec.get('position'))
                except:
                    pass
                out.append(rec)
            out_path = os.path.join(output_dir, f"etape_{num_str}_jeune.json")
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(out, f, ensure_ascii=False, indent=2)
            print(f"Wrote stage young results to {out_path}")
        else:
            print(f"Warning: No expected columns for stage young results in {fname}. Found: {df.columns.tolist()}")
        # General young results
        if 'general time' in df.columns:
            df_gen = df.rename(columns={
                'rank': 'position',
                'name': 'nom',
                'team': 'equipe',
                'general time': 'jeune',
                'player': 'joueur'
            })
            keep_cols_gen = [c for c in ['position', 'nom', 'equipe', 'jeune', 'joueur'] if c in df_gen.columns]
            if keep_cols_gen:
                records = df_gen[keep_cols_gen].to_dict(orient='records')
                out = []
                for rec in records:
                    try:
                        rec['position'] = int(rec.get('position'))
                    except:
                        pass
                    out.append(rec)
                out_path = os.path.join(output_dir, f"general_etape_{num_str}_jeune.json")
                with open(out_path, 'w', encoding='utf-8') as f:
                    json.dump(out, f, ensure_ascii=False, indent=2)
                print(f"Wrote general young results to {out_path}")
            else:
                print(f"Warning: No expected columns for general young results in {fname}. Found: {df.columns.tolist()}")
        else:
            print(f"Warning: 'General Time' column not found for general young in {fname}.")
    else:
        print(f"Warning: 'Young results' sheet not found in {fname}")

def extract_results(input_dir, metadata, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    for idx, entry in enumerate(metadata, start=1):
        if 'numero' not in entry:
            entry['numero'] = idx
        process_xls_file(input_dir, entry, output_dir)

def main():
    parser = argparse.ArgumentParser(description="Script pour extraire JSON depuis fichiers XLS multi-onglets")
    parser.add_argument('--dir', '-d', required=True, help="Répertoire contenant les fichiers .xls")
    parser.add_argument('--metadata', '-m', required=True, help="Chemin du fichier JSON de metadata rempli")
    parser.add_argument('--output', '-o', required=True, help="Répertoire de sortie pour JSON extraits")
    args = parser.parse_args()

    input_dir = args.dir
    metadata = read_metadata(args.metadata)
    extract_results(input_dir, metadata, args.output)

if __name__ == "__main__":
    main()
