from flask import Flask, render_template, request, jsonify
from flask_wtf import FlaskForm
from wtforms import FileField
from flask_uploads import configure_uploads, IMAGES, UploadSet
from classify_birds import classify

app = Flask(__name__)

app.config['SECRET_KEY'] = 'thisisasecret'
app.config['UPLOADED_IMAGES_DEST'] = 'uploads/images'

images = UploadSet('images', IMAGES)
configure_uploads(app, images)


class MyForm(FlaskForm):
    image = FileField('image')

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
        result = classify('uploads/images/' + filename)

        return jsonify(
            result=result
    )
    return render_template('./index.html')

if __name__==('__main__'):
    app.run(host="0.0.0.0")