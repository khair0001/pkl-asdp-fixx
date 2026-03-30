## Template Rute Kapal
1. digunakan untuk mengatur kapal yang muncul dan urutannya sesuai rute di produksi bulanan
2. digunakan untuk laporan bulanan ketika ada kapal asdp rute

## Penting
ketika menexport databasenya, dan ingin mengimportnya lagi ada yang perlu diganti. Karena nanti kadang error dibagian v_laporan_harian, dibagian 

```
ORDER BY `p`.`tanggal_produksi` DESC, `p`.`created_at` AS `DESCdesc` ASC  ;
```


ganti dengan 
``` bash
ORDER BY `p`.`tanggal_produksi` DESC, `p`.`created_at` DESC  ;
```
