package com.esep_project.demo;
import java.util.Map;

public class GitRepo {
    private String since;
    private String to;
    private String numOfCommits;
    private String linesAdded;
    private String linesRemoved;
    private String changedSetMax;
    private String changedSetAverage;
    private String codeChurnAverage;
    private String codeChurnMax;
    private String countContributors;
    private String countMinorContributors;
    private String hunksCount;
    private String[] contributorContributions;

    public GitRepo(String since, String to, String numOfCommits, String linesAdded, String linesRemoved, String changedSetMax, String changedSetAverage, String codeChurnAverage, String codeChurnMax, String countContributors, String countMinorContributors, String hunksCount, String[] contributorContributions) {
        this.since = since;
        this.to = to;
        this.numOfCommits = numOfCommits;
        this.linesAdded = linesAdded;
        this.linesRemoved = linesRemoved;
        this.changedSetMax = changedSetMax;
        this.changedSetAverage = changedSetAverage;
        this.codeChurnAverage = codeChurnAverage;
        this.codeChurnMax = codeChurnMax;
        this.countContributors = countContributors;
        this.countMinorContributors = countMinorContributors;
        this.hunksCount = hunksCount;
        this.contributorContributions = contributorContributions;
    }

    public String getSince() {
        return since;
    }

    public void setSince(String since) {
        this.since = since;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getNumOfCommits() {
        return numOfCommits;
    }

    public void setNumOfCommits(String numOfCommits) {
        this.numOfCommits = numOfCommits;
    }

    public String getLinesAdded() {
        return linesAdded;
    }

    public void setLinesAdded(String linesAdded) {
        this.linesAdded = linesAdded;
    }

    public String getLinesRemoved() {
        return linesRemoved;
    }

    public void setLinesRemoved(String linesRemoved) {
        this.linesRemoved = linesRemoved;
    }

    public String getChangedSetMax() {
        return changedSetMax;
    }

    public void setChangedSetMax(String changedSetMax) {
        this.changedSetMax = changedSetMax;
    }

    public String getChangedSetAverage() {
        return changedSetAverage;
    }

    public void setChangedSetAverage(String changedSetAverage) {
        this.changedSetAverage = changedSetAverage;
    }

    public String getCodeChurnAverage() {
        return codeChurnAverage;
    }

    public void setCodeChurnAverage(String codeChurnAverage) {
        this.codeChurnAverage = codeChurnAverage;
    }

    public String getCodeChurnMax() {
        return codeChurnMax;
    }

    public void setCodeChurnMax(String codeChurnMax) {
        this.codeChurnMax = codeChurnMax;
    }

    public String getCountContributors() {
        return countContributors;
    }

    public void setCountContributors(String countContributors) {
        this.countContributors = countContributors;
    }

    public String getCountMinorContributors() {
        return countMinorContributors;
    }

    public void setCountMinorContributors(String countMinorContributors) {
        this.countMinorContributors = countMinorContributors;
    }

    public String getHunksCount() {
        return hunksCount;
    }

    public void setHunksCount(String hunksCount) {
        this.hunksCount = hunksCount;
    }

    public String[] getContributorContributions() {
        return contributorContributions;
    }

    public void setContributorContributions(String[] contributorContributions) {
        this.contributorContributions = contributorContributions;
    }

    @java.lang.Override
    public java.lang.String toString() {
        return "GitRepo:\n" +
                " - since: " + since + '\n' +
                " - to: " + to + '\n' +
                " - numOfCommits: " + numOfCommits + '\n' +
                " - linesAdded: " + linesAdded + '\n' +
                " - linesRemoved: " + linesRemoved + '\n' +
                " - changedSetMax: " + changedSetMax + '\n' +
                " - changedSetAverage: " + changedSetAverage + '\n' +
                " - codeChurnAverage: " + codeChurnAverage + '\n' +
                " - codeChurnMax: " + codeChurnMax + '\n' +
                " - countContributors: " + countContributors + '\n' +
                " - countMinorContributors: " + countMinorContributors + '\n' +
                " - hunksCount: " + hunksCount + '\n' +
                " - contributorContributions: " + java.util.Arrays.toString(contributorContributions);
    }
}