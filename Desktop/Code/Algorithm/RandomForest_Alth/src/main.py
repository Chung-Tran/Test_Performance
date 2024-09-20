import numpy as np
from tensorflow import keras
from tkinter import *
from tkinter import ttk, filedialog
from PIL import Image, ImageTk
from keras.datasets import mnist
from concurrent.futures import ThreadPoolExecutor
import time
from sklearn.metrics import accuracy_score

class DecisionTree:
    def __init__(self, max_depth=10, max_features=None):
        self.max_depth = max_depth
        self.max_features = max_features
        
    def fit(self, X, y):
        self.n_classes = len(np.unique(y))
        self.n_features = X.shape[1]
        self.tree = self._grow_tree(X, y)
        
    def predict(self, X):
        return np.array([self._predict(inputs) for inputs in X])
    
    def _best_split(self, X, y):
        m = self.max_features or self.n_features
        features = np.random.choice(self.n_features, m, replace=False)
        
        best_gain = -np.inf
        split_idx, split_threshold = None, None
        
        for feature_idx in features:
            X_column = X[:, feature_idx]
            thresholds = np.unique(X_column)
            if len(thresholds) > 10:
                thresholds = np.random.choice(thresholds, 10, replace=False)
            
            for threshold in thresholds:
                gain = self._information_gain(X_column, y, threshold)
                if gain > best_gain:
                    best_gain = gain
                    split_idx = feature_idx
                    split_threshold = threshold
        
        return split_idx, split_threshold

    def _information_gain(self, X_column, y, split_threshold):
        parent_entropy = self._entropy(y)
        
        left_idxs = X_column < split_threshold
        right_idxs = ~left_idxs
        
        if np.sum(left_idxs) == 0 or np.sum(right_idxs) == 0:
            return 0
        
        n = len(y)
        n_left, n_right = np.sum(left_idxs), np.sum(right_idxs)
        e_left, e_right = self._entropy(y[left_idxs]), self._entropy(y[right_idxs])
        child_entropy = (n_left / n) * e_left + (n_right / n) * e_right
        
        return parent_entropy - child_entropy

    def _entropy(self, y):
        _, counts = np.unique(y, return_counts=True)
        probabilities = counts / len(y)
        return -np.sum(probabilities * np.log2(probabilities + 1e-10))

    def _grow_tree(self, X, y, depth=0):
        n_samples, n_features = X.shape
        n_labels = len(np.unique(y))
        
        if depth >= self.max_depth or n_labels == 1 or n_samples < 2:
            return np.argmax(np.bincount(y))
        
        feature_idx, threshold = self._best_split(X, y)
        
        if feature_idx is None:
            return np.argmax(np.bincount(y))
        
        left_idxs = X[:, feature_idx] < threshold
        right_idxs = ~left_idxs
        
        left = self._grow_tree(X[left_idxs], y[left_idxs], depth + 1)
        right = self._grow_tree(X[right_idxs], y[right_idxs], depth + 1)
        
        return {'feature_idx': feature_idx, 'threshold': threshold, 'left': left, 'right': right}
    
    def _predict(self, inputs):
        node = self.tree
        while isinstance(node, dict):
            if inputs[node['feature_idx']] < node['threshold']:
                node = node['left']
            else:
                node = node['right']
        return node

class RandomForest:
    def __init__(self, n_trees=10, max_depth=10, max_features=None):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.max_features = max_features
        self.trees = []
        
    def fit(self, X, y):
        self.trees = []
        start_time = time.time()
        with ThreadPoolExecutor() as executor:
            futures = []
            for i in range(self.n_trees):
                idxs = np.random.choice(len(X), len(X), replace=True)
                tree = DecisionTree(max_depth=self.max_depth, max_features=self.max_features)
                future = executor.submit(tree.fit, X[idxs], y[idxs])
                futures.append((future, tree))
                
                # In tiến trình
                print(f"Đang huấn luyện cây thứ {i+1}/{self.n_trees}")
            
            for i, (future, tree) in enumerate(futures):
                future.result()  # Chờ cây huấn luyện hoàn tất
                self.trees.append(tree)  # Lưu cây đã huấn luyện
                
                # In tiến trình
                elapsed_time = time.time() - start_time
                avg_time_per_tree = elapsed_time / (i + 1)
                estimated_time_left = avg_time_per_tree * (self.n_trees - i - 1)
                print(f"Đã hoàn thành {i+1}/{self.n_trees} cây. Ước tính thời gian còn lại: {estimated_time_left:.2f} giây")
        
        total_time = time.time() - start_time
        print(f"Hoàn thành huấn luyện trong {total_time:.2f} giây")
    def predict(self, X):
        tree_preds = np.array([tree.predict(X) for tree in self.trees])
        return np.apply_along_axis(lambda x: np.argmax(np.bincount(x)), axis=0, arr=tree_preds)

# Load MNIST dataset and train Random Forest
print("Đang tải dữ liệu MNIST...")
(X_train, y_train), (X_test, y_test) = mnist.load_data()

print("Đang chuẩn bị dữ liệu...")
X_train_flat = X_train.reshape(X_train.shape[0], -1) / 255.0
X_test_flat = X_test.reshape(X_test.shape[0], -1) / 255.0

print("Bắt đầu huấn luyện Random Forest...")
model = RandomForest(n_trees=50, max_depth=10, max_features=int(np.sqrt(X_train_flat.shape[1])))
model.fit(X_train_flat[:10000], y_train[:10000])

print("Huấn luyện hoàn tất. Khởi động ứng dụng nhận dạng số...");

print("Đang kiểm tra mô hình...")
y_pred = model.predict(X_test_flat[:1000])
print(f"Tính chính xác trên tập dữ liệu kiểm tra: {accuracy_score(y_test[:1000], y_pred)}")
# Tkinter app for image upload and prediction
root = Tk()
root.title("Number Recognition App")


frame = Frame(root, height=400, width=400, bg='white')
frame.pack(fill="both", expand=True)

canvas = Canvas(frame, width=300, height=300, relief=RIDGE, bd=2)
canvas.pack(padx=10, pady=10)

def predict_number(img_data):
    img_data = img_data.reshape(1, -1)  # Đảm bảo hình dạng của dữ liệu đầu vào
    prediction = model.predict(img_data)[0]
    return prediction   

def upload_image():
    img_path = filedialog.askopenfilename(
    initialdir="/", 
    title="Select Image",
    filetypes=(("PNG files", "*.png"), 
               ("JPEG files", "*.jpg;*.jpeg"), 
               ("All files", "*.*"))
)
    if img_path:
        img = Image.open(img_path).convert('L').resize((28, 28))
        img_data = np.array(img).reshape(1, -1) / 255.0
        
        img_display = img.resize((300, 300))
        img_display = ImageTk.PhotoImage(img_display)
        canvas.create_image(150, 150, image=img_display)
        canvas.image = img_display
        
        predicted_number = predict_number(img_data)
        result_label.config(text=f"Predicted Number: {predicted_number}")

upload_btn = Button(frame, text="Upload Image", bg='black', fg='gold', font=('ariel 15 bold'), command=upload_image)
upload_btn.pack(pady=20)

result_label = Label(frame, text="", font=('ariel 15 bold'), bg='white')
result_label.pack(pady=10)

root.mainloop()