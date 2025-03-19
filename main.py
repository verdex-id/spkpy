from flask import Flask, request, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)

@app.route('/saw', methods=['POST'])
def calculate_saw():
    data = request.json
    
    if not data or 'alternatives' not in data or 'weights' not in data:
        return jsonify({"error": "Invalid input format"}), 400
    
    # 
    # Membaca data alternatif dan kriteria
    # 
    df_matrix = pd.DataFrame(data['alternatives'])
    df_weights = pd.Series(data['weights'])
    
    # 
    # Normalisasi Matriks Keputusan
    # 
    normalized_matrix = df_matrix.copy()
    for col in df_weights.keys():
        max_val = df_matrix[col].max()
        normalized_matrix[col] = df_matrix[col] / max_val
    
    # 
    # Menghitung skor SAW
    # 
    normalized_matrix["Skor"] = normalized_matrix[list(df_weights.keys())].dot(df_weights)
    
    # 
    # Menyusun hasil ranking
    # 
    result = normalized_matrix.sort_values(by="Skor", ascending=False)[["Nama", "Skor"]].to_dict(orient="records")
    
    return jsonify({"ranking": result})

if __name__ == '__main__':
    app.run(debug=True)
