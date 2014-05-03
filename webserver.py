import subprocess

import flask
app = flask.Flask(__name__)

def run(cmd):
    if isinstance(cmd, basestring):
        cmd = cmd.split()
    return (line.strip() for line in subprocess.check_output(cmd).decode('utf-8').strip().split('\n'))

@app.route('/')
def index():
    return flask.render_template('index.html', albums=[])

@app.route('/albums')
def albums():
    albums = []
    for line in run('beet list -a -f $id|$album|$albumartist'):
        (albumid, album, artist) = line.split('|')
        albums.append({
            'id': albumid,
            'title': album,
            'artist': artist,
        })
    return flask.jsonify({'albums': albums})

@app.route('/album/<albumid>')
def album(albumid):
    tracks = []
    for line in run('beet list album_id:%s -f $id|$track|$title' % albumid):
        (itemid, tracknum, title) = line.split('|')
        tracks.append({
            'itemid': itemid,
            'tracknum': tracknum,
            'title': title,
        })
    tracks.sort(key=lambda t: t['tracknum'])
    return flask.jsonify({'tracks': tracks})

@app.route('/file/<itemid>')
def get_file(itemid):
    lines = list(run('beet list id:%s -f $path' % itemid))
    print lines
    if not lines:
        flask.abort(404)
    path = lines[0]
    assert path.startswith('/home/yang/music/')
    return flask.redirect(path.replace('/home/yang', ''))

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=8338)
