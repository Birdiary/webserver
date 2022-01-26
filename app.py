from flask import Flask, render_template, request, jsonify
from flask_wtf import FlaskForm
from wtforms import FileField
from flask_mongoengine import MongoEngine
import json
from flask_uploads import configure_uploads, IMAGES, UploadSet
from classify_birds import classify
import uuid


app = Flask(__name__)

app.config['SECRET_KEY'] = 'thisisasecret'
app.config['UPLOADED_IMAGES_DEST'] = 'static/data/images'
app.config['MONGODB_SETTINGS'] = {
    'db': 'your_database',
    'host': 'localhost',
    'port': 27017
}
db = MongoEngine()
db.init_app(app)

images = UploadSet('images', IMAGES)
configure_uploads(app, images)



class Location(db.EmbeddedDocument):
    lat = db.FloatField()
    lon = db.FloatField()

class Environment(db.DynamicEmbeddedDocument):
    env_id = db.StringField()
    date = db.DateTimeField()
    temp = db.StringField()

class Detection(db.DynamicEmbeddedDocument):
    det_id = db.StringField()
    date = db.DateTimeField()
    image = db.URLField()
    weight = db.FloatField()

class Movements(db.DynamicEmbeddedDocument):
    mov_id = db.StringField()
    start_date =db.DateTimeField()
    end_date = db.DateTimeField()
    audio= db.URLField()
    environment = db.EmbeddedDocumentField(Environment)
    detections = db.ListField(db.EmbeddedDocumentField(Detection))

class Measurement(db.EmbeddedDocument):
    environment = db.ListField(db.EmbeddedDocumentField(Environment))
    movements = db.ListField(db.EmbeddedDocumentField(Movements))

class Mail(db.DynamicEmbeddedDocument):
    adresses = db.ListField(db.StringField())
    
class Box(db.DynamicDocument):
    box_id = db.StringField()
    name = db.StringField()
    location = db.EmbeddedDocumentField(Location)
    measurements = db.EmbeddedDocumentField(Measurement)
    mail = db.EmbeddedDocumentField(Mail)
    

@app.route('/')
def index():
    return render_template('./ui/index.html')



@app.route('/image', methods=['Get', 'POST'])
def image():
    if request.method=="POST":
        # this line goes to the console/terminal in flask dev server
        data = request.files['image']
        print (data)
        # this line prints out the form to the browser
        #return jsonify(data)
        filename = images.save(data)
        result = classify('static/data/images/' + filename)

        return jsonify(
            result=result
    )
    return render_template('./index.html')

@app.route('/box', methods=['GET', 'POST'])
def add_box():
    if request.method=="POST":
        body = request.get_json()
        location = Location()
        location.lat = body['location']['lat']
        location.lon = body['location']['lon']
        measurement= Measurement()
        mail = Mail()
        list= mail.adresses
        for mailToInsert in body['mail']['adresses']:
            print(mailToInsert)
            list.append(mailToInsert)
        mail.adresses = list
        id = str(uuid.uuid4())
        print(mail)
        # Add object to movie and save
        box = Box(box_id = id, location=location, name=body['name'], measurements = measurement, mail=mail).save()
        return id, 201
    boxes = Box.objects()
    return  jsonify(boxes), 200

@app.route('/box/<box_id>', methods=['GET'])
def get_one_box(box_id: str):
    box = Box.objects(box_id=box_id).first_or_404()
    return jsonify(box), 200

@app.route('/movement/<box_id>', methods=['POST'])
def add_movement(box_id: str):
    content_type = request.headers.get('Content-Type')
    print(content_type)
    box = Box.objects(box_id=box_id).first_or_404()

    ##TODO: Count Birds in image and Crop images to bird onyl 
    
    

    body = request.form['json']



    movementsClass = Movements()
    mov_id = str(uuid.uuid4())
    movementsClass.mov_id = mov_id
    movementsClass.start_date = body.start_date
    movementsClass.end_date = body.end_date

    

    
    for detection in body.detections:
        image = request.files[detection.image]
        detectionClass = Detection()

    # this line prints out the form to the browser
    #return jsonify(data)
        filename = images.save(image)
        result = classify('static/data/images/' + filename)
        if result[0][0] > 0.5:
            bird_name = result[0][1]
            detectionClass.count = {bird_name: 1}
        det_id = str(uuid.uuid4())
        detectionClass.det_id = det_id
        detectionClass.image = "http://localhost:5000/static/data/images/" + filename
        detectionClass.weight = detection.weight
        movementsClass.detections.append(detectionClass)
        


    #print (body)
    #print(result)
        # this line prints out the form to the browser
        #return jsonify(data)
    #filename = images.save(data)
    #result = classify('static/data/images/' + filename)
    movementList = box.measurements.movements
    print(movementList)

    return jsonify(box), 200

if __name__==('__main__'):
    app.run(host="0.0.0.0", debug=True)