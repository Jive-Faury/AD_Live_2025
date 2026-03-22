# me - This DAT
# 
# dat - The DAT that received the key event
# key - The name of the key attached to the event.
#		This tries to be consistent regardless of which language
#		the keyboard is set to. The values will be the english/ASCII
#		values that most closely match the key pressed.
#		This is what should be used for shortcuts instead of 'character'.
# character - The unicode character generated.
# alt - True if the alt modifier is pressed
# ctrl - True if the ctrl modifier is pressed
# shift - True if the shift modifier is pressed
# state - True if the event is a key press event
# time - The time when the event came in milliseconds
# cmd - True if the cmd modifier is pressed

def onKey(dat, key, character, alt, lAlt, rAlt, ctrl, lCtrl, rCtrl, shift, lShift, rShift, state, time, cmd, lCmd, rCmd):
	return

# shortcutName is the name of the shortcut

def onShortcut(dat, shortcutName, time):
	if shortcutName == 'ctrl.alt.0':
		op('snapShotUI/buttonRadio1').par.Value0 = 0
	if shortcutName == 'ctrl.alt.1':
		op('snapShotUI/buttonRadio1').par.Value0 = 1
	elif shortcutName == 'ctrl.alt.2':
		op('snapShotUI/buttonRadio1').par.Value0 = 2
	elif shortcutName == 'ctrl.alt.3':
		op('snapShotUI/buttonRadio1').par.Value0 = 3
	elif shortcutName == 'ctrl.alt.4':
		op('snapShotUI/buttonRadio1').par.Value0 = 4
	elif shortcutName == 'ctrl.alt.5':
		op('snapShotUI/buttonRadio1').par.Value0 = 5
	elif shortcutName == 'ctrl.alt.6':
		op('snapShotUI/buttonRadio1').par.Value0 = 6
	elif shortcutName == 'ctrl.alt.7':
		op('snapShotUI/buttonRadio1').par.Value0 = 7
	elif shortcutName == 'ctrl.alt.8':
		op('snapShotUI/buttonRadio1').par.Value0 = 8
	elif shortcutName == 'ctrl.alt.9':
		op('snapShotUI/buttonRadio1').par.Value0 = 9


	return;
	