from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/saw', methods=['POST'])
def calculate_saw():
    data = request.json
    
    if not data or 'alternatives' not in data or 'criteria' not in data:
        return jsonify({"error": "Invalid input format"}), 400
    
    # Read alternatif dan kriteria
    alternatives = []
    for alt in data['alternatives']:
        row = {"Nama": alt["Nama"]}
        row.update(alt["Kriteria"])
        alternatives.append(row)
    
    df_matrix = pd.DataFrame(alternatives)
    
    # Ambil bobot dan jenis
    criteria_info = pd.DataFrame.from_dict(data['criteria'], orient='index')
    df_weights = criteria_info["Bobot"]
    
    # Normalisasi
    normalized_matrix = df_matrix.copy()
    for col in df_weights.keys():
        if criteria_info.loc[col, "Jenis"].upper() == "BENEFIT":
            max_val = df_matrix[col].max()
            normalized_matrix[col] = df_matrix[col] / max_val
        else:  # COST
            min_val = df_matrix[col].min()
            normalized_matrix[col] = min_val / df_matrix[col]
    
    # Hitung skor
    normalized_matrix["Skor"] = normalized_matrix[list(df_weights.keys())].dot(df_weights)
    
    # Sorting
    result = normalized_matrix.sort_values(by="Skor", ascending=False)[["Nama", "Skor"]].to_dict(orient="records")
    
    return jsonify({"ranking": result})

if __name__ == '__main__':
    app.run(debug=True)
