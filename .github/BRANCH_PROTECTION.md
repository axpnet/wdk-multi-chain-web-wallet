# 🛡️ Branch Protection via Rulesets

Questa guida spiega come configurare la protezione del branch `main` tramite GitHub Rulesets per mantenere la qualità del codice e prevenire push diretti non verificati.

## 📋 Perché usare i Rulesets?

I **Rulesets** sono la nuova modalità di GitHub per proteggere i branch, più flessibile delle vecchie "Branch Protection Rules". Permettono di:

- ✅ Richiedere Pull Request prima del merge
- ✅ Obbligare status checks (CI/CD) passed
- ✅ Impedire push diretti su `main`
- ✅ Richiedere review da altri collaboratori
- ✅ Proteggere da force-push e cancellazioni

---

## 🚀 Come configurare (Step-by-Step)

### 1. Accedi alle impostazioni del repository

1. Vai su: https://github.com/axpnet/wdk-multi-chain-web-wallet/settings
2. Nel menu laterale, clicca su **Rules** → **Rulesets**

### 2. Crea un nuovo Ruleset

1. Clicca su **New ruleset** → **New branch ruleset**
2. Compila i campi:

**Nome del Ruleset:**
```
main-branch-protection
```

**Enforcement status:**
- ✅ **Active** (attiva subito le regole)

---

### 3. Seleziona i branch target

**Target branches:**
- Seleziona: **Add target** → **Include by pattern**
- Pattern: `main`

Questo applicherà le regole solo al branch `main`.

---

### 4. Configura le regole di protezione

Attiva le seguenti opzioni:

#### ✅ Restrict creations
- Impedisce la creazione di branch con nome `main` (già esistente, ma è buona prassi)

#### ✅ Restrict deletions
- Impedisce la cancellazione accidentale del branch `main`

#### ✅ Require a pull request before merging
- **Required approvals:** `1` (minimo 1 review approvata)
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (se hai un file `CODEOWNERS`)

#### ✅ Require status checks to pass
- Clicca su **Add checks**
- Cerca e aggiungi:
  - `build` (dal workflow `ci.yml`)
  - `lint` (dal workflow `ci.yml`)
  - `quality` (opzionale, dal workflow `quality.yml`)

**Opzioni:**
- ✅ **Require branches to be up to date before merging**

#### ✅ Block force pushes
- Impedisce `git push --force` su `main`

---

### 5. Bypass list (Eccezioni)

Se sei l'unico maintainer, puoi:
- Lasciare vuoto (nessun bypass)
- Oppure aggiungere te stesso per emergenze:
  - **Bypass list:** → **Add bypass** → **Repository admin**

⚠️ **Attenzione:** con bypass attivo, puoi comunque pushare direttamente su `main`. Per una protezione massima, non aggiungere bypass.

---

### 6. Salva il Ruleset

1. Scorri in basso
2. Clicca su **Create**
3. Il Ruleset è ora attivo! 🎉

---

## 📊 Configurazione Consigliata (Riepilogo)

| Setting | Valore Consigliato | Perché |
|---------|-------------------|--------|
| **Target branches** | `main` | Protegge solo il branch principale |
| **Require PR** | ✅ Yes | Ogni modifica passa per review |
| **Required approvals** | 1 | Almeno una review prima del merge |
| **Dismiss stale approvals** | ✅ Yes | Re-review dopo nuovi commit |
| **Status checks** | `build`, `lint` | CI/CD deve passare |
| **Require up-to-date** | ✅ Yes | Branch aggiornato prima del merge |
| **Block force pushes** | ✅ Yes | Impedisce riscrittura storico |
| **Restrict deletions** | ✅ Yes | Impedisce cancellazione branch |
| **Bypass list** | Vuoto (o admin) | Nessun bypass per massima sicurezza |

---

## 🔄 Workflow con Ruleset attivo

### Prima (senza protezione):
```bash
git add .
git commit -m "fix: qualcosa"
git push origin main  # ✅ push diretto su main
```

### Dopo (con protezione):
```bash
# 1. Crea un branch feature
git checkout -b fix/qualcosa

# 2. Fai le modifiche
git add .
git commit -m "fix: qualcosa"

# 3. Pusha il branch
git push origin fix/qualcosa

# 4. Vai su GitHub e crea una Pull Request
# 5. Aspetta che CI/CD passi (build, lint)
# 6. Richiedi review (se hai collaboratori)
# 7. Merge della PR su main
```

---

## 🛠️ Testare la protezione

Per verificare che funzioni:

```bash
# Prova a pushare direttamente su main
git checkout main
echo "test" >> README.md
git add README.md
git commit -m "test: protezione"
git push origin main
```

**Risultato atteso:**
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
```

Se vedi questo errore, la protezione funziona! ✅

---

## 📚 Alternative per progetti personali

Se lavori da solo e vuoi più flessibilità:

### Opzione 1: Protezione leggera
- ✅ Require status checks (solo build/lint)
- ✅ Block force pushes
- ❌ NO require PR (puoi pushare diretto se CI passa)
- ✅ Bypass list: te stesso

### Opzione 2: Solo CI/CD
- ✅ Require status checks
- ❌ Tutto il resto disabilitato
- Benefit: CI/CD deve passare, ma puoi pushare diretto

---

## 🔗 Risorse utili

- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Best practices for protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

---

## ✅ Checklist finale

Prima di attivare il Ruleset, verifica:

- [ ] I workflow CI/CD funzionano correttamente
- [ ] Hai identificato i nomi corretti degli status checks (`build`, `lint`)
- [ ] Hai deciso se permettere bypass per admin
- [ ] Hai comunicato le nuove regole ai collaboratori (se presenti)
- [ ] Hai testato la protezione con un push di test

---

**Configurato da:** axpdev  
**Data:** Ottobre 2025  
**Repository:** wdk-multi-chain-web-wallet
