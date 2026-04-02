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
	
	if shortcutName == 'shift.r':
		op.reset.click()
		op.pars.par.Resetalllfo.pulse()
	
	elif shortcutName =='ctrl.alt.t':
		op.record.par.Play = 0 if op.record.par.Play == 1 else 1

	elif shortcutName =='ctrl.alt.;':
		Frame = me.time.frame
		me.time.frame = Frame +1
		
	elif shortcutName == 'ctrl.alt.p':
		op.postEngine.par.Postscreen = 1 if op.postEngine.par.Postscreen == 0 else 0

	elif shortcutName == 'ctrl.alt.f':
		op.postEngine.par.Fullview = 1 if op.postEngine.par.Fullview == 0 else 0
	
	elif shortcutName == 'ctrl.alt.a':
		op.render.op('cam1').par.Autorotate = 1 if op.render.op('cam1').par.Autorotate == 0 else 0
	
	elif shortcutName == 'ctrl.shift.alt.r':
		op.render.par.Record = 1 if op.render.par.Record == 0 else 0
		
	elif shortcutName == 'shift.e':
		op.render.op('cam1').par.Reset.pulse()
	
	return
	