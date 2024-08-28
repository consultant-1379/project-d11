package com.esep_project.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.sql.*;
import java.io.*;
import java.util.Map;

import org.json.simple.*;
import org.springframework.beans.factory.annotation.Autowired;
import javax.servlet.http.HttpServletResponse;



@RestController
public class GitController {

    @Autowired
    HttpServletResponse response;


    @GetMapping(value = {"/passParams/{urlFirst}/{urlSecond}/{urlThird}/{since}/{to}"})
    public String searchGit(@PathVariable Map <String, String> myMap) throws IOException {
        String urlFirst = "https://" + myMap.get("urlFirst");
        String urlSecond = myMap.get("urlSecond");
        String urlThird = myMap.get("urlThird");
        String fullUrl = "";

        fullUrl = urlFirst + "/" + urlSecond + "/" + urlThird;

        //String fullUrl = urlFirst + "/" + urlSecond + "/" + urlThird + "/" + urlFourth;
        String since = myMap.get("since");
        String to = myMap.get("to");
        response.setHeader("Access-Control-Allow-Origin", "*");
        String command = "python main.py " + fullUrl + " " + since + " " + to;
        System.out.println(command);

        Process p = Runtime.getRuntime().exec(command);
        p.getInputStream();
        System.out.println("url: " + fullUrl + "\nsince: " + since + "\nto: " + to);
        BufferedReader in = new BufferedReader(new InputStreamReader(p.getInputStream()));
        while(in.readLine()!=null){
            System.out.println(in.readLine());
        }
        return "yay";
    }

    @RequestMapping("/searchSQLite")
    public JSONObject searchSQLite() throws IOException{
        response.setHeader("Access-Control-Allow-Origin", "*");

        JSONArray mainArray = new JSONArray();
        JSONObject mainObject = new JSONObject();

        int id = 0;
        String repo = "";
        String since = "";
        String to = "";


        Connection conn = null;
        try {
            // db parameters
            String url = "jdbc:sqlite:gitMining.db";
            // create a connection to the database
            conn = DriverManager.getConnection(url);

            System.out.println("Connection to SQLite has been established.");

            Statement myStatement = conn.createStatement();
            ResultSet set = myStatement.executeQuery("SELECT * FROM search;");

            while(set.next()){
                id = set.getInt("searchID");
                repo = set.getString("repo");
                since = set.getString("sinceDate");
                to = set.getString("toDate");
                JSONObject searchObject = new JSONObject();
                searchObject.put("ID", id);
                searchObject.put("Repo",  repo);
                searchObject.put("Since", since);
                searchObject.put("To", to);
                mainArray.add(searchObject);
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException ex) {
                System.out.println(ex.getMessage());
            }
        }
        mainObject.put("Searches", mainArray);
        return mainObject;
    }

    @RequestMapping("/searchSQLiteContributions")
    public JSONObject searchSQLiteContributions() throws IOException{
        response.setHeader("Access-Control-Allow-Origin", "*");
        int contributorID = 0;
        int searchID = 0;
        String contributor = "";
        int contributions = 0;
        JSONArray mainArray = new JSONArray();
        JSONObject mainObject = new JSONObject();
        Connection conn = null;
        try {
            // db parameters
            String url = "jdbc:sqlite:gitMining.db";
            // create a connection to the database
            conn = DriverManager.getConnection(url);

            System.out.println("Connection to SQLite has been established.");

            Statement myStatement = conn.createStatement();
            ResultSet set = myStatement.executeQuery("SELECT * FROM contributions;");
            System.out.println(set);
            while(set.next()){
                contributorID = set.getInt("contributorID");
                searchID = set.getInt("searchID");
                contributor = set.getString("contributor");
                contributions = set.getInt("contributions");
                JSONObject searchObject = new JSONObject();
                searchObject.put("ContributorID", contributorID);
                searchObject.put("SearchID", searchID);
                searchObject.put("Contributor", contributor);
                searchObject.put("Contributions", contributions);
                mainArray.add(searchObject);
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException ex) {
                System.out.println(ex.getMessage());
            }
        }
        mainObject.put("ContributionsPerContributor", mainArray);
        return mainObject;
    }

    @RequestMapping("/searchSQLiteStats")
    public JSONObject searchSQLiteStats() throws IOException{
        response.setHeader("Access-Control-Allow-Origin", "*");
        int statID = 0;
        int searchID = 0;
        int commits = 0;
        int added = 0;
        int removed = 0;
        int setMax = 0;
        int setAvg = 0;
        int churnAvg = 0;
        int churnMax = 0;
        int contributors = 0;
        int minContributors = 0;
        int hunks = 0;
        JSONArray mainArray = new JSONArray();
        JSONObject mainObject = new JSONObject();

        Connection conn = null;
        try {
            // db parameters
            String url = "jdbc:sqlite:gitMining.db";
            // create a connection to the database
            conn = DriverManager.getConnection(url);
            System.out.println("Connection to SQLite has been established.");
            Statement myStatement = conn.createStatement();
            ResultSet set = myStatement.executeQuery("SELECT * FROM stats;");
            System.out.println(set);
            while(set.next()){
                statID = set.getInt("statID");
                searchID = set.getInt("searchID");
                commits = set.getInt("commits");
                added = set.getInt("added");
                removed = set.getInt("removed");
                setMax = set.getInt("setMAX");
                setAvg = set.getInt("setAVG");
                churnAvg = set.getInt("churnAVG");
                churnMax = set.getInt("churnMAX");
                contributors = set.getInt("contributors");
                minContributors = set.getInt("minContributors");
                hunks = set.getInt("hunks");

                JSONObject searchObject = new JSONObject();
                searchObject.put("StatID", statID);
                searchObject.put("SearchID", searchID);
                searchObject.put("Commits", commits);
                searchObject.put("Added", added);
                searchObject.put("Removed", removed);
                searchObject.put("SetMax", setMax);
                searchObject.put("SetAvg", setAvg);
                searchObject.put("ChurnAvg", churnAvg);
                searchObject.put("ChurnMax", churnMax);
                searchObject.put("Contributors", contributors);
                searchObject.put("MinorContributors", minContributors);
                searchObject.put("Hunks", hunks);
                mainArray.add(searchObject);
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException ex) {
                System.out.println(ex.getMessage());
            }
        }
        mainObject.put("Stats", mainArray);
        return mainObject;
    }
}
