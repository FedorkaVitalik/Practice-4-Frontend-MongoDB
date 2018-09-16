$(function () {
	var marks = ['Відмінно', 'Добре', 'Задовільно', 'Незадовільно'];

	// Створення Select для опцій з оцінками
	var $markSel = $('<select/>').attr('class', 'studMarks');
	$('<option/>').appendTo($markSel);

	// Цикл, який перебирає масив marks та вставляє кожний елемент масива marks в опцію Селекта з оцінками
	for (var i in marks) {
		var mark = marks[i];
		$('<option/>').attr('value', mark).text(mark).appendTo($markSel);
	}

	let faculties = 'http://localhost:3000/getGlobal';
	//Завантаження глобальних даних
	function getGlobalData(data) {
		// Очищає список факультетів (з id = facult)
		$('#facult').empty();

		// Цикл, який перебирає елементи в об'єкті faculties (факультети), та створює кожному елементу об'єкта faculties опцію, яку додає до елемента (селект) з id = facult

		for (var i in data) {
			$('<option/>').attr('value', i).text(i).appendTo($('#facult'));
		}

		// функція, яка завантажує спеціальності, та створює кожному елементу об'єкта faculties[f] (тобто спеціальності) опцію, яку додає до елемента (селект) з id = special
		function loadSpecial() {
			var f = $('#facult').val();
			$('#special').empty();
			for (var s in data[f]) {
				$('<option/>').attr('value', s).text(s).appendTo($('#special'));
			}
		}

		// функція, яка завантажує предмети, та створює кожному елементу об'єкта faculties[f][s][c] (тобто курси) опцію, яку додає до елемента (селект) з id = subject
		function loadSubject() {
			var f = $('#facult').val();
			var s = $('#special').val();
			var c = $('#course').val();
			var subjects = data[f][s][c];
			$('#subject').empty();
			for (var i in subjects) {
				var subject = subjects[i];
				$('<option/>').attr('value', subject).text(subject).appendTo($('#subject'));
			}
		}
		// //Завантажує спеціальності на початку та оновлює їх при пов'язаних змінах
		loadSpecial();
		$('#facult').change(loadSpecial);

		//Завантажує предмети на початку та оновлює їх при пов'язаних змінах
		loadSubject();
		$('#facult').change(loadSubject);
		$('#special').change(loadSubject);
		$('#course').change(loadSubject);

		//Завантажує студентів на початку та оновлює їх при пов'язаних змінах
		loadStudents();
		$('#facult').change(loadStudents);
		$('#special').change(loadStudents);
		$('#course').change(loadStudents);
		$('#subject').change(loadStudents);
	}

	$.getJSON(faculties, function (data) {
		getGlobalData(data);
	});

	// функція, яка міняє колір залежно від значення селекта з оцінками (тобто залежно від опції даного селекта), та запам'ятовує це значення
	function studMarkColor($markSel) {
		switch ($markSel.val()) {
			case 'Відмінно':
			case 'Добре':
			case 'Задовільно':
				$markSel.parent().parent().css('background-color', 'green');
				break;
			case 'Незадовільно':
				$markSel.parent().parent().css('background-color', 'red');
				break;
		}
		return $markSel;
	}

	//функція, яка записує вибрані значення предмета та оцінки, в обєкт студента та міняє колір від вибраної оцінки
	function studMarksEvents() {
		$('select.studMarks').change(function () {
			var setMarkUrl = 'http://localhost:3000/setMark';

			let params = {
				facult: $('#facult').val(),
				spec: $('#special').val(),
				course: $('#course').val(),
				student: $(this).parent().prev('.stud').text(),
				subj: $('#subject').val(),
				mark: $(this).val()
			};

			$.post(
				setMarkUrl,
				params,
				function (data) {
					console.log(data);
				},
				'json'
			);

			studMarkColor($(this));
		});
	}

	$('#retake').click(function () {
		let retakeUrl = 'http://localhost:3000/retake';

		$.post(
			retakeUrl,
			function (data) {
				$('#losersBody').empty();
				$('#loseFacultLength').empty();
				console.log(data);
				let retakeInfoArrays = data.retakeInfo;

				for (let retakeInfo of retakeInfoArrays) {
					var newTr = $('<tr/>');
					$(newTr).appendTo($('#losersBody'));
					$('<td/>').addClass('loser').text(retakeInfo.student).appendTo(newTr);
					$('<td/>').addClass('loserSubj').text(retakeInfo.subj).appendTo(newTr);
					$('<td/>').addClass('loserFacult').text(retakeInfo.f).appendTo(newTr);
					$('<td/>').addClass('loserSpecial').text(retakeInfo.s).appendTo(newTr);
				}
				let facultCounterInfo = data.facultCounterInfo;
				for (let faculty in facultCounterInfo) {
					let facultCounter = facultCounterInfo[faculty];
					var newTr = $('<tr/>');
					$(newTr).appendTo($('#loseFacultLength'));
					$('<td/>').text(faculty + ': ' + facultCounter).appendTo(newTr);
				}
			},
			'json'
		);
	});

	// функція, яка завантажує студентів, та записує кожного студента в таблицю
	// запамятовує вибрану оцінку в селекті, робить вибраною опцію  оцінки.
	// При зміні студентів, вибрана оцінка запамятовується, та при виборі цього
	//  ж студента та предмета, опція оцінки буде вибраною
	// міняє колір залежно від оцінки


	function addNoteRecord(student, mark) {
		var newTr = $('<tr/>');
		$(newTr).appendTo($('#tbody'));
		$('<td/>').addClass('stud').text(student).appendTo(newTr);

		// добавити вибір оцінки (Select) напроти кожного студента
		//Створюється копія створеного Select і вибирається збережена оцінка
		$newMarkSel = $markSel.clone().val(mark);
		$('<td/>').appendTo(newTr).append($newMarkSel);
		studMarkColor($newMarkSel);
		studMarksEvents();
	}

	function showNote(data) {
		$('#tbody').empty();
		console.log(data)
		for (var student in data) {
			addNoteRecord(student, data[student])
		}
		studMarksEvents();
	}

	function loadStudents() {
		let getNoteURL = 'http://localhost:3000/getNote';

		let params = {
			facult: $('#facult').val(),
			spec: $('#special').val(),
			course: $('#course').val(),
			subj: $('#subject').val()
		};

		$.getJSON(getNoteURL, params, function (data) {
			showNote(data)
		});
	}

	function newStudEvent() {
		$('#addStud').click(function () {
			let newStud = $('#newStudent').val()
			if (!newStud) {
				alert('ПІБ студента не вказано')
				return;
			}

			let newStudUrl = 'http://localhost:3000/addStud';
			let params = {
				facult: $('#facult').val(),
				spec: $('#special').val(),
				course: $('#course').val(),
				subj: $('#subject').val(),
				newStud
			};

			$.post(
				newStudUrl,
				params,
				function (data) {
					if (data.result === true) {
						addNoteRecord(params.newStud, null)
						$('#newStudent').val('');
					}
				},
				'json'
			)


		});
	}

	function deleteStudent() {
		$('#delStud').click(function () {
			$('button.deleteEachStud').remove();
			$('select.studMarks').each(function (i, el) {
					$(this).after('<button class="deleteEachStud"> - ');
				}),
				$('button.deleteEachStud').click(function () {
					let deleteUrl = 'http://localhost:3000/deleteStud';
					let params = {
						facult: $('#facult').val(),
						spec: $('#special').val(),
						course: $('#course').val(),
						subj: $('#subject').val(),
						stud: $(this).parent().prev('.stud').text()
					};
					if (confirm('Ви впевнені, що хочете видалити даного студента?')) {
						$.post(
							deleteUrl,
							params,
							function (data) {
								loadStudents();
							},
							'json'
						);
					} else {}
					$('button.deleteEachStud').hide();
				});
		});
	}

	newStudEvent();
	deleteStudent();

	//функція, яка при нажатій кнопці з id = click таблицю зі студентами робить видимою
	$('#click').click(function () {
		$('#studentsList').show();
	});

	$('#retake').click(function () {
		$('#losersList').show();
	});

	// сортування студентів у таблиці
	$('#tbody').sortable();
	$('#tbody').disableSelection();

	$('#losersBody').sortable();
	$('#losersBody').disableSelection();
});