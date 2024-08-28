# import functions
from operations import *
from datetime import datetime
import sys
import sqlite3


# main method
def main():
    try:
        print("hello cunt")
        # Take in command line arguments
        fileRepo = sys.argv[1]
        sinceString = sys.argv[2]
        toString = sys.argv[3]
    except:
        print("Wrong command line arguments given. Must be in the form - filerepo yyyy-mm-dd yyyy-mm-dd")

    # Uncomment to use command line arguments
    since = datetime(int(sinceString.split("-")[0]), int(sinceString.split("-")[1]), int(sinceString.split("-")[2]))
    to = datetime(int(toString.split("-")[0]), int(toString.split("-")[1]), int(toString.split("-")[2]))

    # # Uncomment to use hardcoded values for date period
    # since = datetime(2020, 1, 1)
    # to = datetime(2022, 12, 12)
    # fileRepo = "https://github.com/aNoma-ly/Web-Sevices-and-API-Development"

    # DB Functions
    def populateSearch(since, to, fileRepo):
        insert_search = """INSERT INTO search(repo, sinceDate, toDate) VALUES (?, ?, ?)"""

        cursor.execute(insert_search, (fileRepo, str(since), str(to)))
        db.commit()

    def populate_contributions(searchId, contributors, contributions):
        for i in range(0, len(contributors)):
            insert_contributions = """INSERT INTO contributions(searchID, contributor, contributions)
                                                                             VALUES(?, ?, ?)"""
            cursor.execute(insert_contributions, (searchId, contributors[i], contributions[i]))
            db.commit()

    def populateStats(searchId, count, addedCount, removedCount, maxSet, averageSet, filesAVG, filesMAX, countContr,
                      countMinorContr, filesCount):
        insert_stats = """INSERT INTO stats(searchID, commits, added, removed, setMAX, setAVG, churnAVG, churnMAX, contributors, minContributors, hunks)
                                                                                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"""
        cursor.execute(insert_stats, (
            searchId, count, addedCount, removedCount, maxSet, averageSet, filesAVG, filesMAX, countContr,
            countMinorContr,
            filesCount))
        db.commit()

    # DB Shit
    with sqlite3.connect("gitMining.db") as db:
        cursor = db.cursor()
    # cursor.execute("DROP TABLE search")
    cursor.execute("""
       CREATE TABLE IF NOT EXISTS search(
       searchID INTEGER PRIMARY KEY,
       repo TEXT NOT NULL,
       sinceDate TEXT NOT NULL,
       toDate TEXT NOT NULL
       );
       """)
    # cursor.execute("""DROP TABLE contributions""")
    cursor.execute("""
       CREATE TABLE IF NOT EXISTS contributions(
       contributorID INTEGER PRIMARY KEY,
       searchID INTEGER,
       contributor TEXT NOT NULL,
       contributions INTEGER NOT NULL,
       FOREIGN KEY (searchID)
       REFERENCES search (searchID)
       );
       """)

    # cursor.execute("""DROP TABLE stats""")
    cursor.execute("""
       CREATE TABLE IF NOT EXISTS stats(
       statID INTEGER PRIMARY KEY,
       searchID INTEGER,
       commits INTEGER NOT NULL,
       added INTEGER NOT NULL,
       removed INTEGER NOT NULL,
       setMAX INTEGER NOT NULL,
       setAVG INTEGER NOT NULL,
       churnAVG INTEGER NOT NULL,
       churnMAX INTEGER NOT NULL,
       contributors INTEGER NOT NULL,
       minContributors INTEGER NOT NULL,
       hunks INTEGER NOT NULL,
       FOREIGN KEY (searchID)
       REFERENCES search (searchID)
       );
       """)

    def setForeignKey():
        cursor.execute("SELECT searchId FROM search WHERE repo = ? AND sinceDate = ? AND toDate = ?",
                       [fileRepo, (since), (to)])

        return cursor.fetchall()

    foreignKey = setForeignKey()
    if not foreignKey:
        # Number of commits and when
        count = countCommits(fileRepo, since, to)

        # Number of lines of code added
        # Number of lines of code removed
        addedCount, removedCount = countLines(fileRepo, since, to)

        # Size of change sets (maximum and average) where a change set is the number of files committed together
        avgSet, maxSet = changedSet(fileRepo, since, to)

        # Code churn (added - removed lines) – size average and maximum
        filesMax, filesAvg = codeChurn(fileRepo, since, to)

        # Count of contributors and minor contributors (those contributing less than 5% to a file)
        countContr, countMinorContr = countContributors(fileRepo, since, to)

        # ContributorsExperience
        countContributions = countContributorContributions(fileRepo, since, to)

        # Hunks count – hunks are continuous blocks of changes–and give an idea of fragmented changes
        filesCount = countHunks(fileRepo, since, to)

        contributorsContributions = []
        contributorsContributions.append("Contributions per contributor")
        for author in countContributions.keys():
            contributorsContributions.append(author)
            contributorsContributions.append(countContributions[author])
        # Export all data to CSV
        data = [
            [since, to, count, addedCount, removedCount, maxSet, avgSet, filesAvg, filesMax, countContr, countMinorContr, filesCount, contributorsContributions]
        ]

#         exportCSV(data)
        # Populate DB
        populateSearch(since, to, fileRepo)
        searchID = setForeignKey()[0][0]
        populate_contributions(searchID, contributorsContributions[1::2], contributorsContributions[2::2])
        # populate_contributions(contributorsContributions[1::])
        populateStats(searchID, count, addedCount, removedCount, maxSet, avgSet, filesAvg, filesMax, countContr,
                      countMinorContr,
                      filesCount)
    else:
        print("Search already exists in the DB")


# __init__
if __name__ == '__main__':
    main()
