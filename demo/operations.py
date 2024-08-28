# pydriller commits
from pydriller import Repository
from pydriller.metrics.process.change_set import ChangeSet
from pydriller.metrics.process.code_churn import CodeChurn
from pydriller.metrics.process.commits_count import CommitsCount
from pydriller.metrics.process.contributors_count import ContributorsCount
from pydriller.metrics.process.hunks_count import HunksCount
from pydriller.metrics.process.lines_count import LinesCount
import csv


# Number of commits and when
def countCommits(fileRepo, since, to):
    metric = CommitsCount(path_to_repo=fileRepo, since=since, to=to)
    addedCount = metric.count()
    totalAddedCount = 0
    for count in addedCount.values():
        totalAddedCount += count

    return totalAddedCount


# Number of lines of code added & Number of lines of code removed
def countLines(fileRepo, since, to):
    metric = LinesCount(path_to_repo=fileRepo, since=since, to=to)

    addedCount = metric.count_added()
    removedCount = metric.count_removed()
    totalAddedCount = 0
    totalRemovedCount = 0
    for count in addedCount.values():
        totalAddedCount += count

    for count in removedCount.values():
        totalRemovedCount += count

    return totalAddedCount, totalRemovedCount


# Size of change sets (maximum and average) where a change set is the number of files committed together
def changedSet(fileRepo, since, to):
    metric = ChangeSet(path_to_repo=fileRepo, since=since, to=to)
    maxSet = metric.max()
    avgSet = metric.avg()
    return maxSet, avgSet


# Code churn (added-removed lines)–size average and maximum
def codeChurn(fileRepo, since, to):
    metric = CodeChurn(path_to_repo=fileRepo, since=since, to=to)
    filesMax = metric.max()
    filesAvg = metric.avg()
    avg = 0
    maxCount = 0
    total = 0
    for count in filesMax.values():
        if count > maxCount:
            maxCount = count
    for element in filesAvg.values():
        total += count
        avg = total / len(filesAvg)
    return maxCount, avg


# Count of contributors and minor contributors (those contributing less than 5% to a file)
def countContributors(fileRepo, since, to):
    metric = ContributorsCount(path_to_repo=fileRepo, since=since, to=to)
    countCont = metric.count()
    countMinorCont = metric.count_minor()

    totalCountCont = 0
    totalMinorCont = 0

    for count in countCont.values():
        totalCountCont += count

    for count in countMinorCont.values():
        totalMinorCont += count

    return totalCountCont, totalMinorCont


# Contributions made per contributor - Currently returns
def countContributorContributions(fileRepo, since, to):
    contributorDict = {}
    for commit in Repository(fileRepo, since=since, to=to).traverse_commits():
        if commit.author.name in contributorDict.keys():
            contributorDict[commit.author.name] += 1
        else:
            contributorDict[commit.author.name] = 1

    return contributorDict


# Hunks count – hunks are continuous blocks of changes–and give an idea of fragmented changes
def countHunks(fileRepo, since, to):
    metric = HunksCount(path_to_repo=fileRepo, since=since, to=to)
    files = metric.count()

    totalHunks = 0

    for count in files.values():
        totalHunks += count

    return totalHunks


def exportCSV(data):
    with open('data.csv', 'w', newline='') as csvfile:
        for value in data:
            my_writer = csv.writer(csvfile, delimiter=',')
            my_writer.writerow(value)
