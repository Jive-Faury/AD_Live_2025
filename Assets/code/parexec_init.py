# me - this DAT
# par - the Par object that has changed
# val - the current value
# prev - the previous value
# 
# Make sure the corresponding toggle is enabled in the Parameter Execute DAT.

def onValueChange(par, prev):
	# use par.eval() to get current value
	#if par.name == 'Savecomptox':
	#	if par == True:
	#		parent().SaveDevelopment()			
	#	else:
	#		parent().SaveStatements()
			
	if par.name == 'Reloadtoxonstart':
		if par == True:
			parent().ReloadToxOnStart()
		else:
			parent().ReloadToxOffStart()
	return

def onPulse(par):
	if par.name == 'Resetall':
		parent().ResetParsAll()
		op.reset.click()
		op.render.op('cam1').par.Reset.pulse()
		op.pars.op('resetAllSliders').run(delayFrames=15)
		op.audioEnable.panel.state =0
		op.audioOptimize.panel.state = 1
		op.activePars.par.Value0 = 0
		op.pars.op('switchInput').par.index = 0
		op.seqActive.par.Value0 = 0
		op.recPars.par.Value0 = 0
		op.compo.par.Value0 = 0
		op.performance.par.Value0 = 'Choose'
		op.camAudioLink.par.Value0 = 0
		op.pars.op('header/chopexec_messagePars').par.active = True
		op.activeSetSaver.par.Value0 = 0
		op.crossPanel.par.Value0 = 0

		
	elif par.name == 'Reinitallcomptox':
		parent().ReInitAllTox()
	
	elif par.name == 'Deletetoxpath':
		parent().SaveStatements()
		
		
	return

def onExpressionChange(par, val, prev):
	return

def onExportChange(par, val, prev):
	return

def onEnableChange(par, val, prev):
	return

def onModeChange(par, val, prev):
	return
	