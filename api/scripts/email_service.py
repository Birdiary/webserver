
import email, smtplib, ssl

from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

def send_email (receiver_email, imageName, imagePath, count, pw, stationPath):
    subject = "Vogel an deiner Fütterungsstation"
    sender_email = "info@wiediversistmeingarten.org"
    password= pw

    # Create a multipart message and set headers
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    context = ssl.create_default_context()
    #message["Bcc"] = receiver_email  # Recommended for mass emails

    textString= "Hallo, da war ein neuer Vogel an deiner Fütterungsstation: \n"

    textString= textString+ "Der Vogel war mit einer Wahrscheinlichkeit von "+ str(round(count[0]['score']*100,2)) + "% ein Vogel der Art \"" + count[0]['latinName'] +"\" ("+count[0]['germanName'] +").\n"

    textString= textString + "Das Video vom Vogel kann unter folgendem Link angeschaut werden: " + imagePath + "\n \n"

    textString= textString + "Die gesammelten Daten der Station können unter folgenem Link angeschaut werden: " + stationPath

    text = MIMEText(textString)
    message.attach(text)

    text = message.as_string()
    print("E-Mail send")
    with smtplib.SMTP_SSL("smtp.strato.de", 465, context=context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, text)

#send_email ("nick121298@outlook.de", "bird.jpg", "../static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash_1.jpg", {
#    "bird1": 1
#})