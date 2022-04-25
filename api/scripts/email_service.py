
import email, smtplib, ssl

from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

def send_email (receiver_email, imageName, imagePath, count, pw):
    subject = "New Bird detected"
    sender_email = "info@countyourbirds.org"
    password= pw

    # Create a multipart message and set headers
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    context = ssl.create_default_context()
    #message["Bcc"] = receiver_email  # Recommended for mass emails

    textString= "Hey, there were birds at your bird feeder: \n"
    for item in count:
        print(item, flush=True)
        textString= textString+ "The bird was with "+ item.score + "% of the species \"" + item.latinName +"\" ("+item.germanName +").\n"

    text = MIMEText(textString)
    message.attach(text)
    im_data = open(imagePath, "rb").read()
    image = MIMEImage(im_data, name= imageName)

    # Add attachment to message and convert message to string
    message.attach(image)
    text = message.as_string()
    print("E-Mail send")
    with smtplib.SMTP_SSL("smtp.strato.de", 465, context=context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, text)

#send_email ("nick121298@outlook.de", "bird.jpg", "../static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash_1.jpg", {
#    "bird1": 1
#})