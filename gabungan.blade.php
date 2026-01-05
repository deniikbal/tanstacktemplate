<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Pengumuman SPMB 2025</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 10px;
      font-size: 15px;
    }

    .page-container {
      width: 190mm;
      margin: 0;
      padding: 5mm;
      box-sizing: border-box;
      text-align: center;
    }

    /* Style untuk template pengumuman */
    .pengumuman-section {
      border: 1px solid #000;
      padding: 20px;
      margin: 10px 0;
      max-width: 720px;
      margin-bottom: 20px;
      width: 100%;
    }

    .pengumuman-header {
      text-align: center;
      margin-bottom: 15px;
      line-height: 1.2;
    }

    .pengumuman-header h1 {
      font-size: 28px;
      margin-bottom: 3px;
      line-height: 1.1;
    }

    .pengumuman-header h2 {
      font-size: 21px;
      margin-top: 0;
      margin-bottom: 2px;
      font-weight: bold;
      line-height: 1.1;
    }

    .pengumuman-header h2.jalur {
      font-size: 24px;
      margin-top: 2px;
      margin-bottom: 15px;
      line-height: 1.1;
    }

    /* Info Section - Table Based */
    .pengumuman-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }
    .pengumuman-info-table td {
      vertical-align: top;
      padding: 10px 20px;
    }
    .pengumuman-info-text-cell {
      width: 55%;
      text-align: left;
      padding-left: 60px;
    }
    .pengumuman-qr-cell {
      width: 45%;
      text-align: center;
    }

    .pengumuman-qr-image {
      width: 120px;
      height: 120px;
      border: 1px solid #ddd;
      padding: 5px;
      background: white;
      border-radius: 8px;
    }

    .pengumuman-data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
    }

    .pengumuman-data-table td {
      padding: 3px 0;
      line-height: 1.3;
    }

    .pengumuman-footer {
      margin-top: 15px;
      text-align: center;
      font-size: 14px;
      padding: 10px;
      border-top: 1px solid #eee;
    }

    .pengumuman-footer p {
      margin: 5px 0;
    }

    /* Footer table for absen box */
    .footer-table {
      width: 100%;
      border-collapse: collapse;
    }
    .footer-table td {
      vertical-align: middle;
      padding: 5px;
    }
    .footer-left {
      text-align: left;
    }
    .footer-right {
      text-align: right;
      width: 150px;
    }
    .absen-box {
      width: 130px;
      height: 90px;
      border: 2.5px solid #000;
      border-radius: 10px;
      text-align: center;
      padding-top: 6px;
    }

    /* Style untuk template cetak */
    .cetak-section {
      border: 1px solid #000;
      padding: 40px;
      width: 720px;
      margin: 20px 0;
    }

    .cetak-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .cetak-header img {
      height: 80px;
      vertical-align: middle;
    }

    .cetak-blue-bar {
      background-color: #63B1E5;
      height: 20px;
      margin: 20px 0;
    }

    .cetak-h2 {
      text-align: center;
      font-weight: 500;
    }

    /* Cetak Info - Table Based */
    .cetak-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }
    .cetak-info-table td {
      vertical-align: top;
      padding: 10px;
    }
    .cetak-qr-cell {
      width: 150px;
      text-align: center;
    }
    .cetak-info-text-cell {
      text-align: left;
    }

    .cetak-qr-code-image {
      width: 120px;
      height: 120px;
      border: 1px solid #ddd;
      padding: 5px;
      background: white;
      border-radius: 8px;
    }

    .cetak-info-text {
      font-size: 16px;
      line-height: 1.0;
    }

    .cetak-info-text p {
      margin: 8px 0;
    }

    .cetak-info-text b {
      font-size: 20px;
    }

    .cetak-attention {
      margin-top: 40px;
      padding: 10px;
      font-size: 14px;
      text-align: left;
    }

    .cetak-footer-bar {
      height: 20px;
      background-color: #009640;
      margin-top: 10px;
    }

    .section-divider {
      border-top: 2px dashed #009640;
      margin: 20px 0;
      width: 100%;
    }

    .page-break {
      page-break-before: always;
      break-before: always;
    }

    .cetak-section-bawah {
      margin-top: 40mm;
    }

    @media print {
      body {
        padding: 5px;
      }

      .page-container {
        padding: 2mm;
        text-align: center;
      }

      .cetak-section {
        margin: 0 auto;
      }

      .pengumuman-qr-image {
        border: 1px solid #ccc;
        border-radius: 8px;
      }

      .cetak-qr-code-image {
        border: 1px solid #ccc;
        border-radius: 8px;
      }

      .cetak-blue-bar {
        background-color: #63B1E5 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .cetak-footer-bar {
        background-color: #009640 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="content-wrapper">
      @php
          $qrCode = $data['qr_code'];
          if (strpos($qrCode, 'data:image') === false) {
          $qrCode = 'data:image/png;base64,' . $qrCode;
          }
      @endphp

      <!-- Template Pengumuman (Section 1) -->
      <div class="cetak-section" style="margin: 0 auto;">
        <div class="pengumuman-header">
          <img src="{{ public_path('img/logo-pemprov-jabar.png') }}" alt="Logo SPMB" style="height: 80px; margin-bottom: 10px;margin-right: 20px">
          <img src="{{ public_path('img/logo-spmb.png') }}" alt="Logo SPMB" style="height: 80px; margin-bottom: 10px;">
          <h1>SPMB SMAN 1 BANTARUJEG</h1>
          <h2>TAHAP 2 TAHUN AJAR 2025/2026</h2>
          <h2 class="jalur" style="display: inline-block; background: #1976d2; color: #fff; padding: 10px 38px; border-radius: 14px; font-size: 28px; font-weight: bold; letter-spacing: 2px; margin-top: 18px; margin-bottom: 18px; border: 3px solid #1565c0;">
            JALUR : {{ strtoupper($data['jalur']) }}
          </h2>
        </div>

        <!-- Info Section using Table -->
        <table class="pengumuman-info-table">
          <tr>
            <td class="pengumuman-info-text-cell">
              <table style="border: none; border-collapse: collapse;font-size:18px">
                <tr>
                  <td style="padding: 0 25px 8px 0; white-space: nowrap;">No. Pendaftar</td>
                  <td style="padding: 0 0 8px 0;font-weight: bold">: {{ $data['no_peserta'] }}</td>
                </tr>
                <tr>
                  <td style="padding: 0 5px 8px 0; white-space: nowrap;">NISN</td>
                  <td style="padding: 0 0 8px 0;font-weight: bold">: {{ $data['nisn'] }}</td>
                </tr>
                <tr>
                  <td style="padding: 0 5px 8px 0; white-space: nowrap;">Nama Lengkap</td>
                  <td style="padding: 0 0 8px 0;font-weight: bold">: {{ $data['nama'] }}</td>
                </tr>
                <tr>
                  <td style="padding: 0 5px 8px 0; white-space: nowrap;">Jenis Kelamin</td>
                  <td style="padding: 0 0 8px 0;font-weight: bold">: {{ $data['jenis_kelamin'] }}</td>
                </tr>
                <tr>
                  <td style="padding: 0 5px 8px 0; white-space: nowrap;">Asal Sekolah</td>
                  <td style="padding: 0 0 8px 0;font-weight: bold">: {{ $data['asal_sekolah'] }}</td>
                </tr>
                <tr>
                  <td style="padding: 0 5px 8px 0; white-space: nowrap;">Status</td>
                  <td style="padding: 0 0 8px 0;font-weight: bold">: {{ $data['status'] }}</td>
                </tr>
              </table>
            </td>
            <td class="pengumuman-qr-cell">
              <img src="{{ $qrCode }}" alt="QR Code" class="pengumuman-qr-image">
            </td>
          </tr>
        </table>

        <!-- Footer using Table -->
        <div class="pengumuman-footer">
          <table class="footer-table">
            <tr>
              <td class="footer-left">
                <p>Silahkan tunjukkan QR Code ini saat melakukan pendaftaran ulang</p>
                <p style="margin-top: 5px; font-size: 13px;">
                  Dicetak pada: {{ now()->format('d/m/Y H:i') }}
                </p>
              </td>
              <td class="footer-right">
                <div class="absen-box">
                  <span style="font-size: 15px; font-weight: bold; color: #222;">No. Absen</span>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Tabel Daftar Ceklis Persyaratan Daftar Ulang -->
      <table style="width: 100%; border-collapse: collapse; margin: 35px 0 50px 0; font-size: 18px;">
        <thead>
          <tr style="background: #e3f2fd;">
            <th style="border: 2px solid #000; padding: 12px 0; text-align: center; font-size: 20px; width: 80%;">Persyaratan Daftar Ulang</th>
            <th style="width: 60px; border: 2px solid #000; padding: 12px 0; font-size: 20px;">Ceklis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 2px solid #000; padding: 14px 18px; text-align: left;">Surat Bukti Kelulusan SPMB 2025 Tahap 2</td>
            <td style="border: 2px solid #000; text-align: center;">
              <div style="width: 32px; height: 32px; border: 2.5px solid #000; border-radius: 6px; display: inline-block;"></div>
            </td>
          </tr>
          <tr>
            <td style="border: 2px solid #000; padding: 14px 18px; text-align: left;">Foto Copy Kartu Keluarga</td>
            <td style="border: 2px solid #000; text-align: center;">
              <div style="width: 32px; height: 32px; border: 2.5px solid #000; border-radius: 6px; display: inline-block;"></div>
            </td>
          </tr>
          <tr>
            <td style="border: 2px solid #000; padding: 14px 18px; text-align: left;">Ijazah SMP/MTs atau Surat Kelulusan atau Kartu Ujian</td>
            <td style="border: 2px solid #000; text-align: center;">
              <div style="width: 32px; height: 32px; border: 2.5px solid #000; border-radius: 6px; display: inline-block;"></div>
            </td>
          </tr>
          <tr>
            <td style="border: 2px solid #000; padding: 14px 18px; text-align: left;">Tata Tertib SMA Negeri 1 Bantarujeg yang sudah ditandatangani di atas meterai</td>
            <td style="border: 2px solid #000; text-align: center;">
              <div style="width: 32px; height: 32px; border: 2.5px solid #000; border-radius: 6px; display: inline-block;"></div>
            </td>
          </tr>
          <tr>
            <td style="border: 2px solid #000; padding: 14px 18px; text-align: left;">Surat Pernyataan Tidak Akan Mengkriminalisasi Sekolah Penyelenggara SPMB</td>
            <td style="border: 2px solid #000; text-align: center;">
              <div style="width: 32px; height: 32px; border: 2.5px solid #000; border-radius: 6px; display: inline-block;"></div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Kotak Keterangan Verifikator -->
      <table style="width: 100%; border: 2px solid #000; border-radius: 8px; margin-bottom: 40px; font-size: 17px;">
        <tr>
          <td style="font-weight: bold; padding: 20px 18px; width: 120px;">Verifikator:</td>
          <td style="border-bottom: 2px solid #000; padding: 20px 18px;"></td>
        </tr>
      </table>

      <div class="page-break"></div>
      <div style="height:15mm"></div>

      <!-- Template Cetak (Section 2) -->
      <div class="cetak-section cetak-section-bawah">
        <div class="cetak-header">
          <img src="{{ public_path('img/logo-pemprov-jabar.png') }}" style="margin-right: 20px" alt="Logo Disdik">
          <img src="{{ public_path('img/logo-spmb.png') }}" alt="Logo SPMB">
        </div>

        <div class="cetak-blue-bar"></div>

        <h2 class="cetak-h2">Pengumuman Hasil Seleksi SPMB Jawa Barat 2025 Tahap 2</h2>

        <!-- Info Section using Table -->
        <table class="cetak-info-table">
          <tr>
            <td class="cetak-qr-cell">
              <img src="{{ $qrCode }}" alt="QR Code" class="cetak-qr-code-image">
            </td>
            <td class="cetak-info-text-cell">
              <div class="cetak-info-text">
                <table style="border: none; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 0 25px 8px 0; white-space: nowrap;">No. Pendaftar</td>
                    <td style="padding: 0 0 8px 0;">: {{ $data['no_peserta'] }}</td>
                  </tr>
                  <tr>
                    <td style="padding: 0 5px 8px 0; white-space: nowrap;">Nama</td>
                    <td style="padding: 0 0 8px 0;font-weight: bold">: {{ $data['nama'] }}</td>
                  </tr>
                  <tr>
                    <td style="padding: 0 5px 8px 0; white-space: nowrap;">Asal Sekolah</td>
                    <td style="padding: 0 0 8px 0;">: {{ $data['asal_sekolah'] }}</td>
                  </tr>
                </table>
                <p style="margin-top: 15px;">Selamat! Anda dinyatakan Diterima di:</p>
                <p style="margin-top: 5px;font-size: 22px; font-weight: bold">SMAN 1 BANTARUJEG - {{ $data['jalur'] }}</p>
              </div>
            </td>
          </tr>
        </table>

        <div class="cetak-attention">
          <strong>PERHATIAN!</strong><br>
          Pendaftar yang telah diterima wajib melakukan daftar ulang di sekolah tujuan pada tanggal <strong>10 Juli 2025 – 11 Juli 2025.</strong>
        </div>

        <div class="cetak-footer-bar"></div>
      </div>
      <div class="section-divider"></div>
    </div> <!-- Penutup content-wrapper -->
  </div>
</body>
</html>