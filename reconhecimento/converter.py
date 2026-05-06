import cv2

img = cv2.imread("funcionarios/Wanessa.jpg")

cv2.imwrite("funcionarios/Wanessa_ok.jpg", img)

print("Imagem convertida com sucesso!")