import tensorflow as tf
from tensorflow import keras
from tkinter import *
from tkinter import ttk, filedialog
from PIL import Image, ImageTk
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from keras.datasets import mnist

# Load MNIST dataset and train Random Forest
(X_train, y_train), (X_test, y_test) = mnist.load_data()

# Flatten the 28x28 images into vectors of size 784
X_train_flat = X_train.reshape(X_train.shape[0], -1) / 255.0
X_test_flat = X_test.reshape(X_test.shape[0], -1) / 255.0

# Train Random Forest
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_flat, y_train)

# Tkinter app for image upload and prediction
root = Tk()
root.title("Number Recognition App")

# Frame for image upload and prediction
frame = Frame(root, height=400, width=400, bg='white')
frame.pack(fill="both", expand=True)

canvas = Canvas(frame, width=300, height=300, relief=RIDGE, bd=2)
canvas.pack(padx=10, pady=10)

def predict_number(img_path):
    # Open the image, resize and convert it to grayscale (28x28)
    img = Image.open(img_path).convert('L').resize((28, 28))
    img_data = np.array(img).reshape(1, -1) / 255.0

    # Predict the number
    prediction = model.predict(img_data)[0]
    return prediction

def upload_image():
    img_path = filedialog.askopenfilename(initialdir="/", title="Select Image",
                                          filetypes=(("PNG files", "*.png"), ("All files", "*.*")))
    if img_path:
        img = Image.open(img_path).resize((300, 300))
        img = ImageTk.PhotoImage(img)
        canvas.create_image(150, 150, image=img)
        canvas.image = img
        
        # Predict the number from the image
        predicted_number = predict_number(img_path)
        result_label.config(text=f"Predicted Number: {predicted_number}")

# Button to upload an image
upload_btn = Button(frame, text="Upload Image", bg='black', fg='gold', font=('ariel 15 bold'), command=upload_image)
upload_btn.pack(pady=20)

# Label to display prediction result
result_label = Label(frame, text="", font=('ariel 15 bold'), bg='white')
result_label.pack(pady=10)

root.mainloop()
