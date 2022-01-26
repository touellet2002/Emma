import speech_recognition as sr
from pydub import AudioSegment


# PyAudio doit être installé avec pipwin.
# pip install pipwin
# pipwin install pyaudio

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
    text = "Je ne sais pas!"
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

