import json
f = open('summary.json',)
data = json.load(f)

p_Tcs_1 = data['root_group']['checks']['Status Check 202']['passes']
p_Tcs_2 = data['root_group']['checks']['Status 400 Err JSON does not conform to schema']['passes']
p_Tcs_3 = data['root_group']['checks']['Status 400 Err Incorrect request api version']['passes']
p_Tcs_4 = data['root_group']['checks']['Status 400 Err Incorrect request Content-Type']['passes']
p_Tcs_5 = data['root_group']['checks']['Status 400 Err Incorrect JSON payload']['passes']
p_Tcs_6 = data['root_group']['checks']['Get Call Status 200 Msg Welcome to VESCollector']['passes']
number_of_passed_tests = p_Tcs_1 + p_Tcs_2 + p_Tcs_3 + p_Tcs_4 + p_Tcs_5 + p_Tcs_6

f_Tcs_1 = data['root_group']['checks']['Status Check 202']['fails']
f_Tcs_2 = data['root_group']['checks']['Status 400 Err JSON does not conform to schema']['fails']
f_Tcs_3 = data['root_group']['checks']['Status 400 Err Incorrect request api version']['fails']
f_Tcs_4 = data['root_group']['checks']['Status 400 Err Incorrect request Content-Type']['fails']
f_Tcs_5 = data['root_group']['checks']['Status 400 Err Incorrect JSON payload']['fails']
f_Tcs_6 = data['root_group']['checks']['Get Call Status 200 Msg Welcome to VESCollector']['fails']
number_of_failed_tests = f_Tcs_1 + f_Tcs_2 + f_Tcs_3 + f_Tcs_4 + f_Tcs_5 + f_Tcs_6

if number_of_passed_tests > 0 and number_of_failed_tests == 0:
    print("K6 Tests have passed and results are verified.")
    print("Number of tests passed: " + str(number_of_passed_tests))
    print("Number of tests failed: " + str(number_of_failed_tests))
    exit(0)
else:
    print("K6 Tests have failed.")
    print("Number of tests passed: " + str(number_of_passed_tests))
    print("Number of tests failed: " + str(number_of_failed_tests))
    exit(-1)