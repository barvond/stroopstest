function postwait
global H maxblockCount blockCount tt ReadTriggerData ioObj stresstype
global BinauralBeat1 PureTone1 Phase PlusTime 





%% Stop Audio
switch Phase
    case 'Vigilance '
    stop(PureTone1)
        
    case 'Experiment'
    stop(BinauralBeat1); stop(PureTone1);          
end

%% Send EEG Marker
% if strcmp(stresstype, 'str') 
% SendTrigger(111,ioObj);
% Plus2_EEGTrig=ReadTriggerData
% end
SendMarker(6)

%% Display + Sign ????????????????????????
tm0=0;
W=PlusTime;
tic; cla(H.ax2); drawnow;
clf
set(H.fig1,'color','k','units','normalized');
set(gcf,'units','normalized','outerposition',[0 0 1 1]);
H.ax2=axis; cla(H.ax2); axis off; axis equal;

h1=text(0.5,0.5,' ','color','w','units','normalized',...
             'fontsize',100,'horizontalAlignment','center');
set(h1,'string',sprintf('+')); 
drawnow;

while 1 %%%%%%%%why not use pause????????
    tm=fix(toc);
    if tm==W
        break;
    end
end
cla(H.ax2); drawnow;

%% Send EEG Marker
% if strcmp(stresstype, 'str') 
% SendTrigger(111,ioObj);
% Plus2_EEGTrig=ReadTriggerData
% end
SendMarker(6)

%% End or Go Back?
tt=0;
blockCount=blockCount+1;
if blockCount>maxblockCount
    dispFinal;  
else    
    dispQues;
end