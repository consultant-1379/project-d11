import unittest
from datetime import datetime

from operations import * 


class TestOperations(unittest.TestCase):
    def test_CommitsCountOutput(self):
        testRepo = "https://github.com/aNoma-ly/VaultKnoxPasswordManager"
        testSinceDate = datetime(2020, 1, 3)
        testToDate = datetime(2022, 8, 8)
        totalCommits = countCommits(testRepo, testSinceDate, testToDate)
        self.assertEqual(totalCommits, 15)

    def test_CountLinesOutput(self):
        testRepo = "https://github.com/aNoma-ly/VaultKnoxPasswordManager"
        testSinceDate = datetime(2020, 1, 3)
        testToDate = datetime(2022, 8, 8)
        totalAdded, totalRemoved = countLines(testRepo, testSinceDate, testToDate)
        self.assertEqual(totalAdded, 2239)
        self.assertEqual(totalRemoved, 1)

    def test_ChangeSetOutput(self):
        testRepo = "https://github.com/aNoma-ly/VaultKnoxPasswordManager"
        testSinceDate = datetime(2020, 1, 3)
        testToDate = datetime(2022, 8, 8)
        maxSet, avgSet = changedSet(testRepo, testSinceDate, testToDate)
        self.assertEqual(maxSet, 14)
        self.assertEqual(avgSet, 8)

    def test_CodeChurnOutput(self):
        testRepo = "https://github.com/aNoma-ly/VaultKnoxPasswordManager"
        testSinceDate = datetime(2020, 1, 3)
        testToDate = datetime(2022, 8, 8)
        filesMax, filesAvg  = codeChurn(testRepo, testSinceDate, testToDate)
        self.assertEqual(filesMax, 1757)
        self.assertEqual(filesAvg, 0)

    def test_CountContributorsOutput(self):
        testRepo = "https://github.com/aNoma-ly/VaultKnoxPasswordManager"
        testSinceDate = datetime(2020, 1, 3)
        testToDate = datetime(2022, 8, 8)
        countCont, countMinContr = countContributors(testRepo, testSinceDate, testToDate)
        self.assertEqual(countCont, 13)
        self.assertEqual(countMinContr, 0)

    def test_CountContributorContributionsOutput(self):
        testRepo = "https://github.com/aNoma-ly/VaultKnoxPasswordManager"
        testSinceDate = datetime(2020, 1, 3)
        testToDate = datetime(2022, 8, 8)
        contributorDict = countContributorContributions(testRepo, testSinceDate, testToDate)
        self.assertEqual(contributorDict, {'aNoma-ly': 2})

    def test_CountHunksOutput(self):
        testRepo = "https://github.com/aNoma-ly/VaultKnoxPasswordManager"
        testSinceDate = datetime(2020, 1, 3)
        testToDate = datetime(2022, 8, 8)
        totalHunks = countHunks(testRepo, testSinceDate, testToDate)
        self.assertEqual(totalHunks, 13)

