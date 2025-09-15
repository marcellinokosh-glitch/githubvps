# Script PowerShell pour commit & push auto
# Place ce fichier dans le dossier du projet et lance-le avec PowerShell

while ($true) {
    git add .
    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto commit $date" | Out-Null
    git push
    Start-Sleep -Seconds 60 # Vérifie toutes les 60 secondes
}
