<?php

$hashcode = $_POST['hash'];
$filename = $_POST['filename'];
$txt = urldecode($_POST['txt']);
$html = urldecode($_POST['html']);

if ($hashcode == "thiago123")
{
  file_put_contents("{$filename}.txt", $txt);
  file_put_contents("{$filename}.html", $html);
  echo 'done';
}
else 
{
  header("HTTP/1.1 401 Unauthorized");
  echo "invalid password";
}