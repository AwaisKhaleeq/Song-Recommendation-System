from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

@app.route('/')
def index():
    # Read the JSON file
    with open('similar_songs_data.json', 'r') as json_file:
        similar_songs_data = json.load(json_file)
    
    # Extract relevant information for display
    songs_info = []
    for song_id, data in similar_songs_data.items():
        song_info = {
            'input_song': {
                'album': data['input_data']['metadata']['album'],
                'artist': data['input_data']['metadata']['artist']
            },
            'similar_songs': []
        }
        for similar_song_id, similar_song_data in data['similar_songs'].items():
            similar_song_info = {
                'album': similar_song_data['metadata']['album'],
                'artist': similar_song_data['metadata']['artist']
            }
            song_info['similar_songs'].append(similar_song_info)
        songs_info.append(song_info)
    
    return render_template('index.html', songs_info=songs_info)

if __name__ == '__main__':
    app.run(debug=True)
