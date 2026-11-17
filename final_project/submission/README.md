# Assignment evidence checklist

Run these commands from a shell while `npm start` is running. Save each command
and its JSON output in the indicated file. `curl.exe` avoids PowerShell's
`curl` alias.

## Tasks 1–7: public routes and authentication

```powershell
# getallbooks.txt
curl.exe -s http://localhost:5000/

# getbooksbyISBN.txt
curl.exe -s http://localhost:5000/isbn/1

# getbooksbyauthor.txt
curl.exe -s "http://localhost:5000/author/Jane%20Austen"

# getbooksbytitle.txt
curl.exe -s "http://localhost:5000/title/Pride%20and%20Prejudice"

# getbookreview.txt
curl.exe -s http://localhost:5000/review/1

# register.txt
curl.exe -s -X POST http://localhost:5000/register -H "Content-Type: application/json" -d '{\"username\":\"student\",\"password\":\"bookpass123\"}'

# login.txt (also stores the session cookie used below)
curl.exe -s -c cookies.txt -X POST http://localhost:5000/customer/login -H "Content-Type: application/json" -d '{\"username\":\"student\",\"password\":\"bookpass123\"}'
```

## Tasks 8–9: authenticated review operations

```powershell
# reviewadded.txt
curl.exe -s -b cookies.txt -X PUT "http://localhost:5000/customer/auth/review/1?review=An%20excellent%20and%20powerful%20novel"

# deletereview.txt
curl.exe -s -b cookies.txt -X DELETE http://localhost:5000/customer/auth/review/1
```

## Tasks 10–11: source and GitHub evidence

- Submit the public GitHub link to `final_project/router/general.js` for Task 10.
- Fork <https://github.com/ibm-developer-skills-network/expressBookReviews>
  into the `Levy008` account using GitHub's **Fork** button.
- Then commit and push this local work:

```powershell
git remote rename origin upstream
git remote add origin https://github.com/Levy008/expressBookReviews.git
git add .
git commit -m "Complete Express book review final project"
git push -u origin main
```

- Task 10 URL after pushing:
  `https://github.com/Levy008/expressBookReviews/blob/main/final_project/router/general.js`
- For Task 11, run the following and save the command and complete response as
  `githubrepo.txt`. The response should contain `"fork": true` and identify
  the IBM repository as its parent.

```powershell
curl.exe -s https://api.github.com/repos/Levy008/expressBookReviews
```

Do not commit `cookies.txt`; it contains a live session cookie.
