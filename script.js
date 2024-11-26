fetch("MAPPING-DATA.json")
    .then(response => response.json())
    .then(data => {
        const departmentSelect = document.getElementById("departmentSelect");

        // 학과 중복 제거 및 리스트 생성
        const majorsSet = new Set(); // 중복 제거용 Set
        const majorToJobsMap = {}; // 학과와 관련 직업, 전망, 직무능력요소를 연결하는 맵

        data.forEach(item => {
            const majors = item.related_majors.split(",").map(major => major.trim()); // 쉼표로 학과 구분
            majors.forEach(major => {
                majorsSet.add(major); // 중복 제거
                if (!majorToJobsMap[major]) {
                    majorToJobsMap[major] = {};
                }
                // 동일 직업 통합
                if (!majorToJobsMap[major][item.job]) {
                    majorToJobsMap[major][item.job] = {
                        outlook: item.outlook
                            ? item.outlook.split(" ").join("\n") // 띄어쓰기를 줄바꿈으로 변경
                            : "정보 없음",
                        skills: new Set() // 직무 능력 중복 제거용 Set
                    };
                }
                // 직무 능력 추가
                const competencyUnits = Array.isArray(item.competencyUnitTitle)
                    ? item.competencyUnitTitle
                    : item.competencyUnitTitle.split(", ");
                competencyUnits.forEach(skill => majorToJobsMap[major][item.job].skills.add(skill.trim()));
            });
        });

        // 학과 옵션 추가
        Array.from(majorsSet).forEach(major => {
            const option = document.createElement("option");
            option.value = major;
            option.textContent = major;
            departmentSelect.appendChild(option);
        });

        // 학과 선택 이벤트
        departmentSelect.addEventListener("change", () => {
            const selectedDept = departmentSelect.value;
            const resultDiv = document.getElementById("result");
            const tableBody = document.getElementById("tableBody");

            if (selectedDept && majorToJobsMap[selectedDept]) {
                const selectedData = majorToJobsMap[selectedDept];

                // 테이블 데이터 초기화
                tableBody.innerHTML = "";

                // 테이블 데이터 생성
                Object.keys(selectedData).forEach(job => {
                    const row = document.createElement("tr");

                    const jobCell = document.createElement("td");
                    jobCell.textContent = job;
                    row.appendChild(jobCell);

                    const outlookCell = document.createElement("td");
                    outlookCell.textContent = selectedData[job].outlook;
                    row.appendChild(outlookCell);

                    const skillsCell = document.createElement("td");
                    skillsCell.textContent = Array.from(selectedData[job].skills).join(", ");
                    row.appendChild(skillsCell);

                    tableBody.appendChild(row);
                });

                resultDiv.style.display = "block";
            } else {
                resultDiv.style.display = "none";
            }
        });
    })
    .catch(error => console.error("데이터 로드 실패:", error));
