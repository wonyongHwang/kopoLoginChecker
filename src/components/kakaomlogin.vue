

<script>
    import axios from 'axios';
    // import Vue from 'vue';
    // import VueSimpleAlert from 'vue-simple-alert';
    // import NaverLogin from './NaverLogin.vue'
    // import NaverLogin from 'vue-naver-login'

    // Vue.use(VueSimpleAlert);
    // let naverCallback = (status) => {
    //     if (status) {
    //     /* (5) 필수적으로 받아야하는 프로필 정보가 있다면 callback처리 시점에 체크 */
    //     var email = naverLogin.user.getEmail();
    //     if( email == undefined || email == null) {
    //         alert("이메일은 필수정보입니다. 정보제공을 동의해주세요.");
    //         /* (5-1) 사용자 정보 재동의를 위하여 다시 네아로 동의페이지로 이동함 */
    //         naverLogin.reprompt();
    //         return;
    //     }

    //     window.location.replace("http://" + window.location.hostname + ( (location.port==""||location.port==undefined)?"":":" + location.port) + "/sample/main.html");
    //     } else {
    //         console.log("callback 처리에 실패하였습니다.");
    //     }
    // }

    export default{
        name: 'kakaomlogin',
        data() {
            return {
                authusers: [],
                acToken: '',
            };
        },
        components: {
            // NaverLogin
        },
        methods: {
            naverCallback(status, info, token) {
                if (status) {
                    /* (5) 필수적으로 받아야하는 프로필 정보가 있다면 callback처리 시점에 체크 */
                    var email = info.email;
                    if( email == undefined || email == null) {
                        alert("이메일은 필수정보입니다. 정보제공을 동의해주세요.");
                        /* (5-1) 사용자 정보 재동의를 위하여 다시 네아로 동의페이지로 이동함 */
                        // this.naverLogin.reprompt();
                        this.$router.push({ path: '/'});
                        return;
                }
                console.log("naver token : "+ token);
                this.acToken = token;
                this.CallBackend(info.email, this.acToken, 0, 'naver');
                // window.location.replace("http://" + window.location.hostname + ( (location.port==""||location.port==undefined)?"":":" + location.port) + "/sample/main.html");
                } else {
                    console.log("callback 처리에 실패하였습니다.");
                }
            },
            // naverLogin() {
                
            //     // window.naverLogin.init()
            //     // window.naverLogin.reprompt()
            //     // console.log(this.$route.params);
            //     // this.naverLogin.getLoginStatus(function(status) {
            // },
            kakaoLogin() {
                // console.log(window.Kakao);
                // this.$alert('인증 확인 중');
                window.Kakao.Auth.login({
                    scope: 'profile,account_email', //, gender', https://developers.kakao.com/docs/latest/ko/kakaologin/common#user-info
                    success: this.GetMe,
                    fail: this.FailMe,
                });
            },
            FailMe(er) {
                console.error(er);
            },
            CallBackend(x, token, cnt = 0, kind = 'kakao') {
                if (cnt > 5) {
                    this.$alert('exceeds call limitation');
                    return;
                }
                // this.$alert(user.email);
                this.$store.state.id = x;
                console.log("* "+ this.$store.state.id);
                this.$store.commit('increment');
                axios.post('http://smart.wonyong.net:3000/users', {
                    //email: userInfo.email // {"user" : {"userid" : "doubletake@kakao.com"}}
                    user: { 'userid': x,
                        'token': token,
                        'kind': kind }
                })
                  .then(res => {
                      console.log(res.data.name);
                      console.log('데이터베이스에 회원 정보가 있음!');
                      //  this.$alert('데이터베이스에 회원 정보가 있음');
                      this.authusers = res.data;
                      console.log(this.authusers);
                      // this.$forceUpdate();
                      //this.$router.push({ path: '/resume/material-dark-kopo/' + x + '/' + res.data['Name'] + '/' + res.data['Total Score'] + '/' + res.data['Rank'],
                      this.$store.state.name = res.data['Name'];
                      this.$store.state.tot = res.data['Total Score'];
                      this.$store.state.rank = res.data['Rank'];
                      this.$store.commit('increment');
                      this.$router.push({ path: '/resume/left-right'});
                    //   this.$router.push({ path: '/profile/' + x + '/' + res.data['Name'] + '/' + res.data['Total Score'] + '/' + res.data['Rank'],
                    //       params: { kakaoid: x
                    //       }
                    //   }
                    //   );
                  })
                  .catch(err => {
                      console.log(err);
                      console.log('데이터베이스에 회원 정보가 없음!');
                      cnt += 1;
                      this.CallBackend(x, token, cnt, kind);
                      //  this.$alert('데이터베이스에 회원 정보가 없음');
                      //  this.$alert(err);
                  });
                console.log(this.authusers);
                // alert('로그인 성공!');
            },
            GetMe(authObj) {
                console.log(authObj);
                this.acToken = authObj.access_token;
                window.Kakao.API.request({
                    url: '/v2/user/me',
                    success: res => {
                        const kakao_account = res.kakao_account;
                        const user = {
                            nickname: kakao_account.profile.nickname,
                            email: kakao_account.email,
                            password: '',
                            account_type: 2,
                        };
                        console.log(user);
                        this.CallBackend(user.email, this.acToken);
                        // this.$bvModal.hide('bv-modal-example');
                    },
                    fail: error => {
                        this.$router.push('/errorPage');
                        console.log(error);
                    }
                });
            }
        }
    };
    // ref : https://daily-life-of-bsh.tistory.com/206
    // backend todo : https://marshmello.tistory.com/65?category=1158454
    
    
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
