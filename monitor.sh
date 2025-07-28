#!/bin/bash

# Basak Chicken 서버 모니터링 스크립트 (개선된 버전)
# 서버 상태를 지속적으로 모니터링하고 문제 발생 시 자동 복구

LOG_FILE="./monitor.log"
RESTART_COUNT_FILE="./logs/restart_count.txt"
MAX_RESTARTS=5
CHECK_INTERVAL=30  # 30초마다 체크

# 로그 함수
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 재시작 횟수 관리
get_restart_count() {
    if [ -f "$RESTART_COUNT_FILE" ]; then
        cat "$RESTART_COUNT_FILE"
    else
        echo "0"
    fi
}

set_restart_count() {
    echo "$1" > "$RESTART_COUNT_FILE"
}

# 서버 상태 확인
check_server() {
    # 3001 포트에서 서버 응답 확인
    if curl -s -f http://localhost:3001 > /dev/null 2>&1; then
        return 0  # 서버 정상
    else
        return 1  # 서버 응답 없음
    fi
}

# PM2 상태 확인
check_pm2() {
    if pm2 list | grep -q "basak-chicken-app.*online"; then
        return 0  # PM2 프로세스 정상
    else
        return 1  # PM2 프로세스 문제
    fi
}

# 서버 재시작
restart_server() {
    local restart_count=$(get_restart_count)
    
    if [ "$restart_count" -ge "$MAX_RESTARTS" ]; then
        log_message "최대 재시작 횟수($MAX_RESTARTS) 초과 - 관리자 개입 필요"
        return 1
    fi
    
    log_message "서버 재시작 시도 ($((restart_count + 1))/$MAX_RESTARTS)"
    
    # PM2 재시작
    pm2 restart basak-chicken-app
    
    # 재시작 대기
    sleep 10
    
    # 재시작 성공 확인
    if check_server; then
        log_message "서버 재시작 성공"
        set_restart_count "0"  # 성공 시 카운트 리셋
        return 0
    else
        set_restart_count "$((restart_count + 1))"
        log_message "서버 재시작 실패 - 재시작 횟수: $((restart_count + 1))"
        return 1
    fi
}

# 메인 모니터링 루프
main() {
    log_message "서버 모니터링 시작 (포트: 3001, 체크 간격: ${CHECK_INTERVAL}초)"
    
    while true; do
        # 서버 상태 확인
        if ! check_server; then
            log_message "서버 응답 없음 - 상태 점검 중..."
            
            # PM2 상태 확인
            if ! check_pm2; then
                log_message "PM2 프로세스 문제 감지 - 재시작 시도"
                restart_server
            else
                log_message "PM2는 정상이지만 서버 응답 없음 - 포트 확인 필요"
                # 포트 상태 확인
                if netstat -tlnp | grep -q ":3001"; then
                    log_message "포트 3001은 열려있음 - 서버 내부 문제 가능성"
                else
                    log_message "포트 3001이 닫혀있음 - 서버 재시작 필요"
                    restart_server
                fi
            fi
        else
            # 서버 정상 시 재시작 카운트 리셋
            set_restart_count "0"
        fi
        
        sleep "$CHECK_INTERVAL"
    done
}

# 스크립트 시작
main 