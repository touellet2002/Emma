import speech_recognition as sr
from pydub import AudioSegment

# filename = "output4.wav"

# initialize the recognizer
# r = sr.Recognizer()

# Permet de générer des strings à partir d'un fichier audio .wav.
def file_to_text(filename):
    with sr.AudioFile(filename) as source:
        r = sr.Recognizer()
        # listen for the data (load audio to memory)
        audio_data = r.record(source)
        # recognize (convert from speech to text)
        text = r.recognize_google(audio_data, language="fr-FR")
        print(text)

# Permet de générer des strings en temps réel à partir du microphone.
def micro_to_text():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        try:
            audio = r.listen(source)
            text = r.recognize_google(audio, language="fr-FR")
        except:
            pass
    return text


# test
print(micro_to_text())

