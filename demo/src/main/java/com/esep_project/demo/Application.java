package com.esep_project.demo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;
import java.io.FileReader;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import com.opencsv.CSVReader;
import org.springframework.boot.autoconfigure.info.ProjectInfoProperties;
import static java.lang.Integer.parseInt;
import static java.lang.Thread.sleep;
import java.sql.*;


@SpringBootApplication
public class Application {

	public static void main(String[] args) throws InterruptedException {
		SpringApplication.run(Application.class, args);
//
//		Map<Integer, GitRepo> GitMap = new HashMap<>();
//		File file = new File("./data.csv");
//		while (!file.exists()) {
//			System.out.println("Waiting for csv file...");
//			file = new File("./data.csv");
//			sleep(10000);
//		}
//		System.out.println("csv file found!");
//
//		AtomicInteger id = new AtomicInteger();
//		try {
//			FileReader filereader = new FileReader(file);
//			CSVReader csvReader = new CSVReader(filereader);
//			String[] nextRecord;
//
//			while ((nextRecord = csvReader.readNext()) != null) {
//				GitRepo newGit = new GitRepo(nextRecord[0], nextRecord[1], nextRecord[2],
//				nextRecord[3], nextRecord[4], nextRecord[5], nextRecord[6],
//				nextRecord[7], nextRecord[8], nextRecord[9],
//				nextRecord[10], nextRecord[11], nextRecord[12].split(","));
//				GitMap.put(id.incrementAndGet(), newGit);
//			}
//		} catch (Exception e) {
//			System.out.println(e);
//		}
//		for (GitRepo repo : GitMap.values()) {
//			System.out.println(repo.toString());
//		}
	}
}