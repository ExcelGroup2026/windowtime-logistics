/* =====================================================================
   WindowTime · ทำให้การบันทึกลง Google Sheet เร็วขึ้น
   ---------------------------------------------------------------------
   ปัญหา: ทุกครั้งที่แอปส่งข้อมูลมาบันทึก สคริปต์เดิมจะ
          1) อ่าน "ค่าทั้งแผ่น" ของชีทนั้น  (Queues ตอนนี้ 2,900 แถว x 23 คอลัมน์)
          2) อ่าน "สูตรทั้งแผ่น" อีกหนึ่งรอบเท่า ๆ กัน
          ทั้งที่ตอนอัพโหลดคิว แถวทุกแถวเป็น "แถวใหม่" ไม่ได้แก้ของเดิมสักแถว
          ยิ่งชีทยาวขึ้น ทุกการบันทึกก็ยิ่งช้าลงตามไปเรื่อย ๆ

   แก้เป็น: อ่านเฉพาะ "คอลัมน์คีย์" เพื่อดูว่าแถวไหนมีอยู่แล้ว (เช่น Queues
          ใช้แค่ 2 คอลัมน์จาก 23) แล้วค่อยอ่านค่า/สูตรเฉพาะช่วงแถวที่ต้องแก้จริง
          ผลลัพธ์ที่เขียนลงชีทเหมือนเดิมทุกประการ

   วิธีใช้ (ทำครั้งเดียว ~2 นาที)
     1. เปิด Google Sheet ของระบบ → เมนู ส่วนขยาย → Apps Script
     2. เปิดไฟล์ที่มีฟังก์ชัน extrasUpsertMany_ อยู่ (ไฟล์ WindowTime Extras)
     3. ลบฟังก์ชัน extrasUpsertMany_ ตัวเดิมทิ้งทั้งก้อน แล้ววางตัวใหม่ข้างล่างนี้แทน
        (หรือจะวางทั้งไฟล์นี้เป็นไฟล์ใหม่ก็ได้ แต่ต้องลบตัวเดิมออกก่อน ไม่งั้นชื่อซ้ำกัน)
     4. กด 💾 บันทึก → ปุ่ม ทำให้ใช้งานได้ (Deploy) → จัดการการทำให้ใช้งานได้
        → ดินสอ ✏️ ที่ deployment เดิม → เวอร์ชัน: ใหม่ → ทำให้ใช้งานได้
        ** ห้ามสร้าง deployment ใหม่ ** เพราะ URL จะเปลี่ยนแล้วแอปจะเชื่อมชีทไม่ได้
     5. ถ้าจะย้อนกลับ: เมนูเดียวกัน เลือกเวอร์ชันก่อนหน้า แล้วทำให้ใช้งานได้อีกครั้ง

   ไม่มีการแก้ข้อมูลในชีทใด ๆ จากไฟล์นี้
   ===================================================================== */


/* ---------------------------------------------------------------------
   บันทึกหลายแถวในครั้งเดียว (ตัวใหม่ · เร็วขึ้น ผลลัพธ์เหมือนเดิม)
   payload: { action:'upsertMany', sheet:'Queues', key:['Queue No. (Q)', ...],
              rows:[ {คอลัมน์:ค่า, ...}, ... ] }
   --------------------------------------------------------------------- */
function extrasUpsertMany_(p) {
  var name = String(p.sheet || '').trim();
  var key = p.key || [];
  var rows = p.rows || [];
  if (!name) throw new Error('ไม่ได้ระบุชีท');
  if (!key.length) throw new Error('ไม่ได้ระบุคอลัมน์คีย์');
  if (!rows.length) return { updated: 0, appended: 0 };

  var sh = extrasSs_().getSheetByName(name);
  if (!sh) throw new Error('Sheet not found: ' + name);

  var lastCol = sh.getLastColumn();
  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h).trim(); });
  var kIdx = key.map(function (k) {
    var i = head.indexOf(String(k).trim());
    if (i < 0) throw new Error('ไม่มีคอลัมน์คีย์ "' + k + '" ในชีท ' + name);
    return i;
  });

  var lastRow = sh.getLastRow();
  var n = Math.max(0, lastRow - 1);

  var norm = function (v) {
    if (Object.prototype.toString.call(v) === '[object Date]') return isNaN(v.getTime()) ? '' : v.toISOString();
    var s = String(v == null ? '' : v).trim();
    return /^\d+$/.test(s) ? String(Number(s)) : s;
  };

  // ---- ดัชนีของแถวที่มีอยู่แล้ว: อ่านเฉพาะคอลัมน์คีย์ (เดิมอ่านทั้งแผ่น 2 รอบ) ----
  var kCols = kIdx.map(function (c) {
    return n ? sh.getRange(2, c + 1, n, 1).getValues() : [];
  });
  var index = {};                       // คีย์ -> เลขแถว (นับจาก 0 ของส่วนข้อมูล)
  for (var i = 0; i < n; i++) {
    var parts = [];
    for (var c = 0; c < kCols.length; c++) parts.push(norm(kCols[c][i][0]));
    index[parts.join('')] = i;
  }

  // ---- แยกเป็น "แก้แถวเดิม" กับ "แถวใหม่" ----
  var patch = {};                       // เลขแถว -> { คอลัมน์: ค่า }
  var fresh = [], freshAt = {};         // แถวใหม่ + ตำแหน่งของมัน เผื่อไฟล์เดียวกันส่งคีย์ซ้ำมา
  rows.forEach(function (obj) {
    var parts = [];
    for (var c = 0; c < kIdx.length; c++) parts.push(norm(obj[head[kIdx[c]]]));
    var k = parts.join('');

    if (index[k] !== undefined) {       // มีอยู่แล้วในชีท → เก็บไว้ไปแก้ทีเดียว
      var row = index[k];
      var pt = patch[row] || (patch[row] = {});
      head.forEach(function (h, c) {
        if (h && Object.prototype.hasOwnProperty.call(obj, h)) pt[c] = obj[h];
      });
      return;
    }
    if (freshAt[k] !== undefined) {     // คีย์เดียวกันส่งมาสองรอบในชุดเดียว → รวมเข้าแถวเดิม
      var nr = fresh[freshAt[k]];
      head.forEach(function (h, c) {
        if (h && Object.prototype.hasOwnProperty.call(obj, h)) nr[c] = obj[h];
      });
      return;
    }
    var line = head.map(function (h) {
      return (h && Object.prototype.hasOwnProperty.call(obj, h)) ? obj[h] : '';
    });
    fresh.push(line);
    freshAt[k] = fresh.length - 1;
  });

  // ---- แก้แถวเดิม: อ่านค่า/สูตร เฉพาะช่วงแถวที่ต้องแก้จริง ----
  var dirtyRows = Object.keys(patch).map(Number).sort(function (a, b) { return a - b; });
  var updated = 0;
  if (dirtyRows.length) {
    var lo = dirtyRows[0], hi = dirtyRows[dirtyRows.length - 1];
    var span = hi - lo + 1;
    var block = sh.getRange(lo + 2, 1, span, lastCol);
    var vals = block.getValues();
    var forms = block.getFormulas();    // เก็บสูตรที่มีอยู่เดิมไว้ ไม่ให้ถูกทับเป็นค่า

    dirtyRows.forEach(function (r) {
      var pt = patch[r];
      var cols = Object.keys(pt).map(Number);
      var a = Math.min.apply(null, cols), b = Math.max.apply(null, cols);
      var line = vals[r - lo];
      var f = forms[r - lo];
      var out = [];
      for (var c = a; c <= b; c++) {
        if (Object.prototype.hasOwnProperty.call(pt, c)) out.push(pt[c]);
        else out.push(f[c] ? f[c] : line[c]);
      }
      sh.getRange(r + 2, a + 1, 1, b - a + 1).setValues([out]);
      updated++;
    });
  }

  // ---- แถวใหม่: ต่อท้ายทีเดียว ----
  if (fresh.length) sh.getRange(lastRow + 1, 1, fresh.length, lastCol).setValues(fresh);

  return { updated: updated, appended: fresh.length };
}


/* ---------------------------------------------------------------------
   ตรวจความเร็วของชีท (อ่านอย่างเดียว · ไม่แก้ข้อมูล)
   เลือกฟังก์ชัน speedCheck ที่แถบด้านบน → กด ▶ เรียกใช้ → ดูที่ บันทึกการทำงาน
   ตัวเลขนี้คือเวลาที่หายไปในทุก ๆ ครั้งที่บันทึก
   --------------------------------------------------------------------- */
function speedCheck() {
  ['Queues', 'TimeStamps', 'Logs'].forEach(function (name) {
    var sh = extrasSs_().getSheetByName(name);
    if (!sh) return;
    var rows = Math.max(0, sh.getLastRow() - 1), cols = sh.getLastColumn();
    if (!rows) return;

    var t0 = Date.now();
    sh.getRange(2, 1, rows, cols).getValues();
    var tAll = Date.now() - t0;

    t0 = Date.now();
    sh.getRange(2, 1, rows, cols).getFormulas();
    var tForm = Date.now() - t0;

    t0 = Date.now();
    sh.getRange(2, 2, rows, 1).getValues();
    var tOne = Date.now() - t0;

    console.log(name + ': ' + rows + ' แถว x ' + cols + ' คอลัมน์'
      + ' · อ่านค่าทั้งแผ่น ' + tAll + ' ms'
      + ' · อ่านสูตรทั้งแผ่น ' + tForm + ' ms'
      + ' · อ่านคอลัมน์เดียว ' + tOne + ' ms');
  });
}
