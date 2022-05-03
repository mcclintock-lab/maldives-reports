import AdmZip from "adm-zip";

const main = async () => {
  var zip = new AdmZip("./report.zip");
  var zipEntries = zip.getEntries();
  console.log(zipEntries.length);

  zipEntries.forEach((entry) => {
    const text = zip.readAsText(entry);
    console.log(text);
  });
};

main();
