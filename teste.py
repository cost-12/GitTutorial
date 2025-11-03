user = ""
def ola_mundo():
    if user == "aluno":
        print("Olá, mundo!!")
    else:
        print("erro...")

user = input("Digite seu nome de usuário: ")
ola_mundo()