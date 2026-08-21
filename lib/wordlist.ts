// Compact common-word list for fast client-side validation.
// Not exhaustive — good enough for a fast-paced party game.
export const WORD_SET = new Set(
  `able about above act add after again age air all allow also always am among
  amount an and animal answer any appear apple area arm around arrive art as
  ask at attack aunt away baby back bad bag ball bank base be bear beat
  beautiful because become bed been before begin behind believe bell below
  best better between big bike bird bit bite black blank blue board boat body
  book born both box boy branch bread break bring brother brown build burn
  business busy but buy by cake call came camp can car card care carry case
  cat catch cause cell center certain chair chance change chart check chief
  child choose city claim class clean clear climb clock close cloth cloud
  club coat cold color come common company complete condition control cook
  cool copy corn corner cost could count country course cover cream cross
  crowd cry cup current cut dad dance dark day dead deal dear death decide
  deep desk develop did die different direct dirt discover distant do dog
  done door double down draw dream dress drink drive drop dry duck during
  each ear early earth east easy eat edge effect egg eight either else end
  enemy energy enjoy enough enter equal even evening ever every exact
  example excite exercise expect eye face fact fair fall family famous far
  farm fast fat father fear feed feel feet fell felt few field fight figure
  fill final find fine finger finish fire first fish fit five flat floor
  flow flower fly follow food foot for force forest forget form found four
  fresh friend from front fruit full fun funny further game garden gas gave
  get gift girl give glad glass go goes gold gone good got government grain
  grass great green grew ground group grow guess guide gun had hair half
  hand happen happy hard has hat have he head hear heard heart heat heavy
  held hello help her here high hill him his history hit hold hole home
  hope horse hot hour house how huge human hundred hunt hurry ice idea if
  important in inside instead into is it its job join joy jump just keep
  kept key kill kind king knew know lady lake land large last late laugh
  law lay lead learn least leave left leg length less let letter level lie
  life light like line list listen little live long look lost lot love low
  luck machine made main make man many map mark market mass matter may maybe
  me mean measure meat meet member men middle might mile milk mind mine
  minute miss mix money month moon more morning most mother mountain mouth
  move much music must my name near need never new next nice night no noise
  north not note nothing notice now number ocean of off offer office often
  oh oil old on once one only open or order other our out over own page pair
  paper part party pass past pattern pay people perhaps person picture piece
  place plan plant play please point poor position possible power practice
  present pretty print probably problem produce program pull push put quick
  quiet quite race radio rain raise ran reach read ready real reason record
  red remember rest return rich ride right ring rise river road rock roll
  room round rule run said sail same sat save saw say school sea season seat
  second see seem sell send sense sent set seven several shall shape share
  she ship shoe shop short should show side sign silent simple since sing
  sister sit six size skin sky sleep small smell smile snow so soft some
  son song soon sound south space speak special stand star start state stay
  step still stone stop store story street strong study such sudden sugar
  summer sun sure table take talk tall team tell ten term test than that the
  their them then there these they thing think third this those though
  thought three through time to today together told too took top total
  touch toward town train travel tree trip trouble true try turn two under
  understand until up upon us use usual very view visit voice wait walk
  want warm was watch water way we wear week well went were west what wheel
  when where which while white who why wide wife will wind window wing wish
  with within without woman wonder wood word work world would write year yes
  yet you young`
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
);

export function isRealWord(word: string) {
  return WORD_SET.has(word.toLowerCase());
}
