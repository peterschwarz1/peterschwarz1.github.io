<?php

$target_dir = "uploads/";
//$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$uploadOk = 1;

print_r($_FILES);
//this will print out the received name, temp name, type, size, etc. 
$input = $_FILES['audio_data']['tmp_name']; //get the temporary name that PHP gave to the uploaded file 
$output = $_FILES['audio_data']['name'].".wav"; //letting the client control the filename is a rather bad idea 
//move the file from temp name to local folder using $output name 
move_uploaded_file($input, $output)

?>