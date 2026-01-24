
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


def send_password_reset_email(receiver_email, reset_link, token, pw, username=None, sender_email="info@wiediversistmeingarten.org"):
    subject = "Birdiary Passwort zuruecksetzen"
    password = pw

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    context = ssl.create_default_context()

    display_name = username.strip() if isinstance(username, str) else ""
    greeting_name = display_name if display_name else "there"
    greeting_line = f"Hallo {greeting_name},\n\n"
    account_lines = f"Account-E-Mail: {receiver_email}\n"
    if display_name:
        account_lines += f"Anzeigename: {display_name}\n"

    text_lines = (
        greeting_line +
        "wir haben eine Anfrage erhalten, das Passwort fuer dein Birdiary-Konto zurueckzusetzen.\n"
        f"{account_lines}\n"
        f"Link zum Zuruecksetzen: {reset_link}\n\n"
        f"Zuruecksetz-Code: {token}\n\n"
        "Wenn du das nicht warst, kannst du diese E-Mail ignorieren."
    )

    text = MIMEText(text_lines)
    message.attach(text)

    text = message.as_string()
    with smtplib.SMTP_SSL("smtp.strato.de", 465, context=context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, text)


def send_email_verification_email(receiver_email, verify_link, token, pw, username=None, sender_email="info@wiediversistmeingarten.org"):
    subject = "Bestaetige dein Birdiary-Konto"
    password = pw

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    context = ssl.create_default_context()

    display_name = username.strip() if isinstance(username, str) else ""
    greeting_name = display_name if display_name else "there"
    greeting_line = f"Hallo {greeting_name},\n\n"

    text_lines = (
        greeting_line +
        "danke fuer deine Registrierung bei Birdiary. Bitte bestaetige deine E-Mail-Adresse.\n\n"
        f"Bestaetigungslink: {verify_link}\n\n"
        f"Bestaetigungscode: {token}\n\n"
        "Falls du dich nicht registriert hast, ignoriere diese E-Mail."
    )

    text = MIMEText(text_lines)
    message.attach(text)

    text = message.as_string()
    with smtplib.SMTP_SSL("smtp.strato.de", 465, context=context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, text)

#send_email ("nick121298@outlook.de", "bird.jpg", "../static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash_1.jpg", {
#    "bird1": 1
#})