import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def getParams():
    return{
        'recipient': 'Der Empfänger der Email.',
        'cc_recipient': 'Ein Nutzer der im CC erwähnt wird.',
        'topic': 'Betreff der Email.',
        'text': 'Der Text der Email.',
        'bcc_recipient': 'Ein Nutzer der im BCC erwähnt wird.',
    }

def send_gmail_email(subject, to_email, cc_email=None, bcc_email=None, body_text=None):
    # Absender und Anmeldeinformationen
    from_email = 'avazz.geilo@gmail.com'
    gmail_password = 'nhczjdepngqwnzpx'

    # Erstellen der E-Mail-Nachricht
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    if cc_email:
        msg['Cc'] = cc_email

    if bcc_email:
        msg['Bcc'] = bcc_email

    msg.attach(MIMEText(body_text, 'plain'))

    # Versenden der E-Mail
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
            smtp_server.login(from_email, gmail_password)
            smtp_server.sendmail(from_email, to_email, msg.as_string())

        print("Die E-Mail wurde erfolgreich versendet!")
        return True
    except Exception as e:
        print(f"Fehler beim Versenden der E-Mail: {e}")
        return False

def app(data, data2):
    print(data)
    return send_gmail_email(subject=data['topic'], to_email=data['recipient'], cc_email=data['cc_recipient'], bcc_email=data['bcc_recipient'], body_text=data['text'])